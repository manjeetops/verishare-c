package com.deqode.webserver.controller

import com.deqode.flows.document.*
import com.deqode.states.*
import com.deqode.webserver.NodeRPCConnection
import com.deqode.webserver.entity.ErrorResponse
import com.google.gson.Gson
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.crypto.SecureHash
import net.corda.core.utilities.getOrThrow
import net.corda.core.utilities.toHex
import org.apache.commons.io.IOUtils
import org.slf4j.LoggerFactory
import org.springframework.core.io.InputStreamResource
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.io.InputStream
import java.security.MessageDigest
import java.util.*
import javax.servlet.http.HttpServletRequest
import javax.ws.rs.core.MediaType

@RestController
@RequestMapping("/documents")
class DocumentController(rpc: NodeRPCConnection) {

    companion object {
        private val logger = LoggerFactory.getLogger(RestController::class.java)
    }

    private val proxy = rpc.proxy

    @PostMapping(produces = [MediaType.APPLICATION_JSON])
    private fun uploadDocument(@RequestParam("document") document: MultipartFile,
                               @RequestParam("ownerId") ownerId: String,
                               @RequestParam("name") name: String,
                               @RequestParam("description") description: String,
                               @RequestParam("frozen") frozen: String,
                               @RequestParam("url") url: String,
                               request: HttpServletRequest): ResponseEntity<Any> {
        val userIdentity = UUID.fromString(request.getHeader("username"))
                ?: throw Exception("username header required")

        val ownerIdentity = UUID.fromString(ownerId)!!
        val md = MessageDigest.getInstance("SHA-256")!!
        val documentHash = SecureHash.parse(md.digest(document.bytes).toHex()) as SecureHash

        if (!proxy.attachmentExists(documentHash)) {
            proxy.uploadAttachment(document.inputStream)
        }

        val type = document.contentType
        val size = document.size
        val frozenStatus = frozen.toLowerCase() == "true"

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(UploadDocumentFlow::class.java,
                    ownerIdentity, name, description, frozenStatus, url, type, documentHash,
                    size.toInt(), userIdentity)

            val signedTransaction = flowHandle.use { it.returnValue.getOrThrow() }

            val documentInfoState = signedTransaction.coreTransaction.outputStates[0] as DocumentInfoState
            HttpStatus.CREATED to documentInfoState.getSerializedDocumentInfoState()
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    @PutMapping(value = ["/{documentId}/version"], produces = [MediaType.APPLICATION_JSON])
    private fun updateDocumentVersion(@RequestParam("document") document: MultipartFile,
                                      @PathVariable("documentId") documentId: String,
                                      request: HttpServletRequest): ResponseEntity<Any> {
        val userIdentity = UUID.fromString(request.getHeader("username"))
                ?: throw Exception("username header required")
        val documentIdentity = UniqueIdentifier.fromString(documentId)
        val md = MessageDigest.getInstance("SHA-256")!!
        val documentHash = SecureHash.parse(md.digest(document.bytes).toHex()) as
                SecureHash

        if (!proxy.attachmentExists(documentHash)) {
            proxy.uploadAttachment(document.inputStream)
        }

        val type = document.contentType
        val size = document.size

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(UpdateDocumentVersionFlow::class.java,
                    documentIdentity, type, documentHash, size.toInt(), userIdentity)

            val signedTransaction = flowHandle.use { it.returnValue.getOrThrow() }

            val documentInfoState = signedTransaction.coreTransaction.outputStates[0] as DocumentInfoState
            HttpStatus.OK to documentInfoState.getSerializedDocumentInfoState()
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    @PostMapping(value = ["/{documentId}/share"], produces = [MediaType.APPLICATION_JSON])
    private fun shareDocumentAccess(@RequestBody requestData: ShareDocumentRequestData,
                                    @PathVariable documentId: String,
                                    request: HttpServletRequest): ResponseEntity<Any> {
        val userIdentity = UUID.fromString(request.getHeader("username"))
                ?: throw Exception("username header required")
        val documentIdentity = UniqueIdentifier.fromString(documentId)
        val receiverIdentity = UUID.fromString(requestData.receiverId)!!

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(ShareDocumentAccessFlow::class.java,
                    documentIdentity, receiverIdentity, requestData.accessType,
                    requestData.accessScope, userIdentity)

            val signedTransaction = flowHandle.use { it.returnValue.getOrThrow() }

            val documentInfoState = signedTransaction.coreTransaction.outputStates[0] as DocumentInfoState
            HttpStatus.OK to documentInfoState.getSerializedDocumentInfoState()
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    @PostMapping(value = ["/{documentId}/transfer"], produces = [MediaType.APPLICATION_JSON])
    private fun transferDocument(@RequestBody requestData: TransferDocumentRequestData,
                                 @PathVariable documentId: String,
                                 request: HttpServletRequest): ResponseEntity<Any> {
        val newOwnerId = UUID.fromString(requestData.newOwnerId)!!
        val documentIdentifier = UniqueIdentifier.fromString(documentId)
        val oldOwnerId = UUID.fromString(request.getHeader("username"))
                ?: throw Exception("username header required")

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(TransferDocumentOwnershipFlow::class.java, documentIdentifier,
                    newOwnerId, oldOwnerId)

            val signedTransaction = flowHandle.use { it.returnValue.getOrThrow() }

            val documentInfoState = signedTransaction.coreTransaction.outputStates[0] as DocumentInfoState
            HttpStatus.OK to documentInfoState.getSerializedDocumentInfoState()
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    @PutMapping(value = ["/{documentId}/freeze"], produces = [MediaType.APPLICATION_JSON])
    private fun freezeDocument(@RequestBody requestData: FreezeDocumentRequestData,
                               @PathVariable documentId: String,
                               request: HttpServletRequest): ResponseEntity<Any> {
        val userId = UUID.fromString(request.getHeader("username"))
                ?: throw Exception("username header required")

        val documentIdentity = UniqueIdentifier.fromString(documentId)
        val frozenStatus = requestData.frozen.toLowerCase() == "true"

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(FreezeDocumentFlow::class.java,
                    documentIdentity, frozenStatus, userId)

            val signedTransaction = flowHandle.use { it.returnValue.getOrThrow() }

            val documentInfoState = signedTransaction.coreTransaction.outputStates[0] as DocumentInfoState
            HttpStatus.OK to documentInfoState.getSerializedDocumentInfoState()
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    @DeleteMapping(value = ["/{documentId}"], produces = [MediaType.APPLICATION_JSON])
    private fun deleteDocument(@PathVariable documentId: String,
                               request: HttpServletRequest): ResponseEntity<Any> {
        val userIdentity = UUID.fromString(request.getHeader("username"))
                ?: throw Exception("username header required")
        val documentIdentity = UniqueIdentifier.fromString(documentId)

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(DeleteDocumentFlow::class.java,
                    documentIdentity, userIdentity)

            val signedTransaction = flowHandle.use { it.returnValue.getOrThrow() }

            val documentInfoState = signedTransaction.coreTransaction.outputStates[0] as DocumentInfoState
            HttpStatus.OK to documentInfoState.getSerializedDocumentInfoState()
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    @PutMapping(value = ["/{documentId}"], produces = [MediaType.APPLICATION_JSON])
    private fun updateDocumentDetails(@RequestBody requestData: UpdateDocumentRequestData,
                                      @PathVariable documentId: String,
                                      request: HttpServletRequest): ResponseEntity<Any> {
        val userIdentity = UUID.fromString(request.getHeader("username"))
                ?: throw Exception("username header required")
        val documentIdentity = UniqueIdentifier.fromString(documentId)

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(UpdateDocumentDetailsFlow::class.java,
                    documentIdentity, requestData.name, requestData.description,
                    requestData.url, userIdentity)

            val signedTransaction = flowHandle.use { it.returnValue.getOrThrow() }

            val documentInfoState = signedTransaction.coreTransaction.outputStates[0] as DocumentInfoState
            HttpStatus.OK to documentInfoState.getSerializedDocumentInfoState()
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    @GetMapping(value = ["/{documentId}"], produces = [MediaType.APPLICATION_JSON])
    private fun getDocumentDetails(@PathVariable documentId: String, request: HttpServletRequest): ResponseEntity<Any> {
        val userIdentity = UUID.fromString(request.getHeader("username"))
                ?: throw Exception("username header required")
        val documentIdentity = UniqueIdentifier.fromString(documentId)

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(GetDocumentAllVersionsFlow::class.java, documentIdentity,
                    userIdentity)

            val documentInfoState = flowHandle.use { it.returnValue.getOrThrow() }
            HttpStatus.OK to documentInfoState
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    @GetMapping(value = ["/{documentId}/download"])
    private fun downloadDocument(@PathVariable documentId: String, request:
    HttpServletRequest): ResponseEntity<Any> {
        val userIdentity = UUID.fromString(request.getHeader("username"))
                ?: throw Exception("username header required")
        val documentIdentity = UniqueIdentifier.fromString(documentId)
        val headers = HttpHeaders()

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(GetDocumentDetailsFlow::class.java, documentIdentity,
                    userIdentity)

            val documentInfoState = flowHandle.use { it.returnValue.getOrThrow() }
            val documentSha = documentInfoState.versions.first {
                it.version == documentInfoState.version
            }.sha256 ?: throw Exception("Document not found")
            val inputStream = InputStreamResource(proxy.openAttachment(documentSha))
            headers["filename"] = documentInfoState.name + ".zip"
            HttpStatus.OK to IOUtils.toByteArray(inputStream.inputStream)
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity<Any>(message, headers, status)
    }

}