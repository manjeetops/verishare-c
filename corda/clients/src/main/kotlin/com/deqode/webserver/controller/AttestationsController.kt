package com.deqode.webserver.controller

import com.deqode.flows.attestation.AttestDocumentFlow
import com.deqode.flows.attestation.GetDocumentAttestationsFlow
import com.deqode.states.AttestDocumentRequestData
import com.deqode.webserver.NodeRPCConnection
import com.deqode.webserver.entity.CustomResponse
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
@RequestMapping("/documents")
class AttestationsController(rpc: NodeRPCConnection) {

    companion object {
        private val logger = LoggerFactory.getLogger(RestController::class.java)
    }

    private val proxy = rpc.proxy

    @PostMapping(value = ["/{documentId}/attestations"], produces = [MediaType.APPLICATION_JSON])
    private fun attestDocument(@RequestBody requestData: AttestDocumentRequestData,
                               @PathVariable documentId: String,
                               request: HttpServletRequest): ResponseEntity<Any> {
        val userId = UUID.fromString(request.getHeader("username")) ?: throw Exception("username header required")
        val documentIdentifier = UniqueIdentifier.fromString(documentId)

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(AttestDocumentFlow::class.java,
                    documentIdentifier, userId, requestData.version.toInt())

            flowHandle.use { it.returnValue.getOrThrow() }

            val customResponse = CustomResponse(HttpStatus.CREATED.value(), "Document $documentId attested successfully")
            HttpStatus.CREATED to Gson().toJson(customResponse)
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

    @GetMapping(value = ["/{documentId}/attestations"], produces = [MediaType.APPLICATION_JSON])
    private fun getDocumentAttestations(@PathVariable("documentId") documentId: String,
                                        request: HttpServletRequest): ResponseEntity<Any> {
        val userIdentifier = UUID.fromString(request.getHeader("username")) ?: throw Exception("username header required")
        val documentIdentifier = UniqueIdentifier.fromString(documentId)

        val (status, message) = try {
            val flowHandle = proxy.startFlowDynamic(GetDocumentAttestationsFlow::class.java,
                    documentIdentifier, userIdentifier)

            val attestationInfoState = flowHandle.use { it.returnValue.getOrThrow() }
            HttpStatus.CREATED to Gson().toJson(attestationInfoState
                    .getSerializedAttestationInfoState())
        } catch (e: Exception) {
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.message.toString(), e.message.toString())
            HttpStatus.BAD_REQUEST to Gson().toJson(errorResponse)
        }

        return ResponseEntity(message, status)
    }

}