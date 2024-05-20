package com.deqode.webserver.controller

import com.deqode.flows.document.GetDocumentsByUserPermissionFlow
import com.deqode.flows.document.GetUserDocumentsFlow
import com.deqode.flows.general.GetUserDetailsFlow
import com.deqode.flows.user.*
import com.deqode.states.*
import com.deqode.webserver.NodeRPCConnection
import com.deqode.webserver.entity.ErrorResponse
import com.google.gson.Gson
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.utilities.getOrThrow
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*
import javax.servlet.http.HttpServletRequest
import javax.ws.rs.core.MediaType

@RestController
@RequestMapping("/users")
class UserController(rpc: NodeRPCConnection) {

    companion object {
        private val logger = LoggerFactory.getLogger(RestController::class.java)
    }

    private val proxy = rpc.proxy


    @PostMapping(produces = [MediaType.APPLICATION_JSON])
    private fun createUser(@RequestBody userRequestData: CreateUserRequestData,
                           request: HttpServletRequest): ResponseEntity<Any> {

        val adminId = UUID.fromString(request.getHeader("username"))
                ?: throw Exception("username header required")

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(CreateUserAccountFlow::class.java,
                    adminId, userRequestData.email, userRequestData.firstName, userRequestData.lastName)

            val signedTransaction = flowHandle.use { it.returnValue.getOrThrow() }

            val publicUserAccountInfoState = signedTransaction.coreTransaction.outputStates[0] as PublicUserAccountInfoState
            HttpStatus.CREATED to publicUserAccountInfoState.getSerializedPublicUserAccountInfo()
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }
        return ResponseEntity(message, status)
    }

    @PutMapping(value = ["/{userId}"], produces = [MediaType.APPLICATION_JSON])
    private fun updateUser(@RequestBody userRequestData: UpdateUserRequestData,
                           @PathVariable userId: String,
                           request: HttpServletRequest): ResponseEntity<Any> {

        val adminId = UUID.fromString(request.getHeader("username"))
                ?: throw Exception("username header required")

        val userIdentifier = UUID.fromString(userId)

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(UpdateUserAccountFlow::class.java,
                    adminId, userIdentifier, userRequestData.status)

            val signedTransaction = flowHandle.use { it.returnValue.getOrThrow() }

            val publicUserAccountInfoState = signedTransaction.coreTransaction.outputStates[0] as PublicUserAccountInfoState
            HttpStatus.OK to publicUserAccountInfoState.getSerializedPublicUserAccountInfo()
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    @GetMapping(value = ["/{userId}"], produces = [MediaType.APPLICATION_JSON])
    private fun getUser(@PathVariable("userId") userId: String): ResponseEntity<Any> {

        val id = UUID.fromString(userId)
        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(GetUserFlow::class.java, id)

            val publicUserAccountInfoState = flowHandle.use { it.returnValue.getOrThrow() }
            HttpStatus.OK to publicUserAccountInfoState.getSerializedPublicUserAccountInfo()
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }
        return ResponseEntity(message, status)
    }

    @GetMapping(produces = [MediaType.APPLICATION_JSON])
    private fun getAllUsers(@RequestParam("pageNo", defaultValue = "1")
                            pageNo: String, @RequestParam("pageSize", defaultValue = "10")
                            pageSize: String): ResponseEntity<Any> {
        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(GetAllUsersFlow::class.java,
                    pageNo.toInt(), pageSize.toInt())

            val usersInfo = flowHandle.use { it.returnValue.getOrThrow() }
            HttpStatus.OK to Gson().toJson(getSerializedUsers(usersInfo))
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    @GetMapping(value = ["/{userId}/documents"], produces = [MediaType.APPLICATION_JSON])
    private fun getUserDocuments(@PathVariable("userId") targetUserId: String,
                                 request: HttpServletRequest,
                                 @RequestParam("pageNo", defaultValue = "1")
                                 pageNo: String, @RequestParam("pageSize", defaultValue = "10")
                                 pageSize: String): ResponseEntity<Any> {
        val userIdentity = UUID.fromString(request.getHeader("username"))
                ?: throw Exception("username header required")

        val targetUserIdentity = UUID.fromString(targetUserId)

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(GetUserDocumentsFlow::class.java,
                    userIdentity, targetUserIdentity, pageNo.toInt(), pageSize.toInt())

            val documentsInfo = flowHandle.use { it.returnValue.getOrThrow() }
            HttpStatus.OK to Gson().toJson(getSerializedUserDocuments(documentsInfo))
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    @GetMapping(value = ["/{userId}/documents-permission"], produces = [MediaType
            .APPLICATION_JSON])
    private fun getAllUserDocumentsByPermission(
            @PathVariable("userId") targetUserId: String,
            @RequestParam("pageNo", defaultValue = "1")
            pageNo: String, @RequestParam("pageSize", defaultValue = "10")
            pageSize: String): ResponseEntity<Any> {
        val userIdentity = UUID.fromString(targetUserId)

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(GetDocumentsByUserPermissionFlow::class.java,
                    userIdentity, pageNo.toInt(), pageSize.toInt())

            val documentsInfo = flowHandle.use { it.returnValue.getOrThrow() }
            HttpStatus.OK to Gson().toJson(getSerializedUserDocuments(documentsInfo))
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    @GetMapping(value = ["/spring-boot/{userId}"], produces = [MediaType.APPLICATION_JSON])
    private fun getUserDetails(@PathVariable("userId") userId: String): ResponseEntity<String> {

        val userIdentity = UniqueIdentifier.fromString(userId).id

        val flowHandle = proxy.startFlowDynamic(GetUserDetailsFlow::class.java, userIdentity)
        val result = flowHandle.use { it.returnValue.getOrThrow() }
        return ResponseEntity(objectToString(result.getSerializedPublicUserAccountInfo()), HttpStatus.OK)
    }

    private fun objectToString(serializedPublicUserAccountInfoState: SerializedPublicUserAccountInfoState): String {

        val parties = serializedPublicUserAccountInfoState.parties.map {
            "\"" + it + "\""
        }
        return "\"id\":\"${serializedPublicUserAccountInfoState.id}\", \"organizationId\":\"${serializedPublicUserAccountInfoState.organizationId}\", \"email\":\"${serializedPublicUserAccountInfoState.email}\", " +
                "\"firstName\":\"${serializedPublicUserAccountInfoState.firstName}\", \"lastName\":\"${serializedPublicUserAccountInfoState.lastName}\", \"status\":\"${serializedPublicUserAccountInfoState.status}\", " +
                "\"role\":\"${serializedPublicUserAccountInfoState.role}\", \"adminPublicKey\":\"${serializedPublicUserAccountInfoState.adminPublicKey}\", \"parties\":${parties}"
    }

    private fun getSerializedUsers(usersInfo: AllUsers): SerializedUsers {

        val users = usersInfo.users.map {
            it.getSerializedPublicUserAccountInfo()
        }
        return SerializedUsers(usersInfo.totalNoOfUsers, users)
    }

    private fun getSerializedUserDocuments(documentsInfo: Documents): SerializedDocuments {

        val documents = documentsInfo.documents.map {
            it.getSerializedDocumentInfoState()
        }
        return SerializedDocuments(documentsInfo.totalDocuments, documents)
    }
}