package com.deqode.entites

import net.corda.core.node.AppServiceHub
import java.util.*

open class User(val userId: UUID, serviceHub: AppServiceHub) {

    fun uploadDocument() {}

    fun updateDocumentDetails() {}

    fun transferDocument() {}

    fun shareDocument() {}

    fun updateDocumentVersion() {}

    fun deleteDocument() {}

    fun getDocument() {}

    fun getUserDocuments() {}

    fun attestDocument() {}

    fun shareAttestation() {}

    fun getUserAccount() {}

    fun getOrganization() {}
}