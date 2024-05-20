package com.deqode.webserver.controller

import com.deqode.flows.organization.*
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
@RequestMapping("/organizations")
class OrganizationController(rpc: NodeRPCConnection) {

    companion object {
        private val logger = LoggerFactory.getLogger(RestController::class.java)
    }

    private val proxy = rpc.proxy

    @PostMapping(produces = [MediaType.APPLICATION_JSON])
    private fun createOrganization(@RequestBody orgRequestData: CreateOrgRequestData): ResponseEntity<Any> {

        val orgId = UniqueIdentifier.fromString(orgRequestData.orgId)
        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(CreateOrganizationFlow::class.java, orgId, orgRequestData.orgUniqueName,
                    orgRequestData.businessName, orgRequestData.description, orgRequestData.adminEmail, orgRequestData.adminFirstName,
                    orgRequestData.adminLastName)
            val signedTransaction = flowHandle.use { it.returnValue.getOrThrow() }

            val organizationInfoState = signedTransaction.coreTransaction.outputStates[0] as OrganizationInfoState
            val adminPublicUserAccountInfoState = signedTransaction.coreTransaction.outputStates[1] as PublicUserAccountInfoState
            val servicePublicUserAccountInfoState = signedTransaction.coreTransaction.outputStates[2] as PublicUserAccountInfoState

            val organizationInfo = OrganizationInfo(organizationInfoState, adminPublicUserAccountInfoState, servicePublicUserAccountInfoState)
            val serializedOrganizationInfo = getSerializedOrganizationInfo(organizationInfo)
            HttpStatus.CREATED to serializedOrganizationInfo
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }
        return ResponseEntity(message, status)
    }

    @PutMapping(value = ["/{organizationId}"], produces = [MediaType.APPLICATION_JSON])
    private fun updateOrganization(@RequestBody orgRequestData: UpdateOrgRequestData,
                                   request: HttpServletRequest): ResponseEntity<Any> {
        UUID.fromString(request.getHeader("username")) ?: throw Exception("username header required")

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(UpdateOrganizationFlow::class.java, orgRequestData.status)
            val signedTransaction = flowHandle.use { it.returnValue.getOrThrow() }

            val organizationInfoState = signedTransaction.coreTransaction.outputStates[0] as OrganizationInfoState
            HttpStatus.OK to organizationInfoState.getSerializedOrganizationInfoState()
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }
        return ResponseEntity(message, status)
    }

    @GetMapping(value = ["/{organizationId}"], produces = [MediaType.APPLICATION_JSON])
    private fun getOrganization(@PathVariable organizationId: String): ResponseEntity<Any> {
        val (status, message) = try {
            val organizationIdentifier = UUID.fromString(organizationId)

            val flowHandle = proxy.startFlowDynamic(GetOrganizationInfoFlow::class.java, organizationIdentifier)

            val organizationInfoState = flowHandle.use { it.returnValue.getOrThrow() }
            HttpStatus.OK to organizationInfoState.getSerializedOrganizationInfoState()
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }
        return ResponseEntity(message, status)
    }

    @GetMapping(value = ["/{organizationId}/users"], produces = [MediaType.APPLICATION_JSON])
    private fun getOrganizationUsers(@RequestParam("pageNo", defaultValue = "1")
                                     pageNo: String, @RequestParam("pageSize", defaultValue = "10")
                                     pageSize: String, @PathVariable organizationId: String): ResponseEntity<Any> {
        val organizationIdentifier = UUID.fromString(organizationId)

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(GetOrganizationUsersFlow::class
                    .java, organizationIdentifier, pageNo.toInt(), pageSize.toInt())

            val organizationUsers = flowHandle.use { it.returnValue.getOrThrow() }

            val serializedOrganizationUsers = getSerializedOrganizationUsers(organizationUsers)
            HttpStatus.OK to Gson().toJson(serializedOrganizationUsers)
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    @GetMapping(produces = [MediaType.APPLICATION_JSON])
    private fun getAllOrganizations(@RequestParam("pageNo", defaultValue = "1")
                                    pageNo: String, @RequestParam("pageSize", defaultValue = "10")
                                    pageSize: String): ResponseEntity<Any> {
        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(GetAllOrganizationsFlow::class
                    .java, pageNo.toInt(), pageSize.toInt())

            val organizationsInfo = flowHandle.use { it.returnValue.getOrThrow() }

            val serializedOrganizationInfo = getSerializedOrganizations(organizationsInfo)
            HttpStatus.OK to Gson().toJson(serializedOrganizationInfo)
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    @GetMapping(value = ["/{organizationId}/documents"], produces = [MediaType.APPLICATION_JSON])
    private fun getOrganizationDocuments(request: HttpServletRequest): ResponseEntity<Any> {
        val userIdentity = UUID.fromString(request.getHeader("username")) ?:  throw Exception("username header required")

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(GetOrganizationDocumentsFlow::class.java,
                    userIdentity)

            val documentsInfo = flowHandle.use { it.returnValue.getOrThrow() }
            HttpStatus.OK to Gson().toJson(getSerializedOrganizationDocuments(documentsInfo))
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    private fun getSerializedOrganizationInfo(organizationInfo: OrganizationInfo): SerializedOrganizationInfo {
        val organizationInfoState = organizationInfo.organizationInfoState
        val adminAccountInfo = organizationInfo.adminAccountInfo
        val serviceAccountInfo = organizationInfo.serviceAccountInfo
        return SerializedOrganizationInfo(organizationInfoState.getSerializedOrganizationInfoState(),
                adminAccountInfo.getSerializedPublicUserAccountInfo(),
                serviceAccountInfo.getSerializedPublicUserAccountInfo())
    }

    private fun getSerializedOrganizations(organizationsInfo: Organizations): SerializedOrganizations {

        val organizations = organizationsInfo.organizations.map {
            it.getSerializedOrganizationInfoState()
        }
        return SerializedOrganizations(organizationsInfo.totalOrganizations, organizations)
    }

    private fun getSerializedOrganizationUsers(organizationUsers: OrganizationUsers): SerializedOrganizationUsers {

        val users = organizationUsers.users.map {
            it.getSerializedPublicUserAccountInfo()
        }
        return SerializedOrganizationUsers(organizationUsers.totalNoOfUsers, users)
    }

    private fun getSerializedOrganizationDocuments(documentsInfo: Documents): SerializedDocuments {

        val documents = documentsInfo.documents.map {
            it.getSerializedDocumentInfoState()
        }
        return SerializedDocuments(documentsInfo.totalDocuments, documents)
    }
}
