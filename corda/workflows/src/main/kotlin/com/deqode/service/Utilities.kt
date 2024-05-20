package com.deqode.service

import net.corda.core.flows.FlowLogic

/** Helper for obtaining a [DocumentService]. */
val FlowLogic<*>.documentService: DocumentService
    get() = serviceHub.cordaService(DocumentService::class.java)

/** Helper for obtaining a [UserService]. */
val FlowLogic<*>.userService: UserService
    get() = serviceHub.cordaService(UserService::class.java)

/** Helper for obtaining a [OrganizationService]. */
val FlowLogic<*>.organizationService: OrganizationService
    get() = serviceHub.cordaService(OrganizationService::class.java)
