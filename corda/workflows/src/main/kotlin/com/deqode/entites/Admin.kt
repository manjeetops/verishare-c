package com.deqode.entites

import net.corda.core.node.AppServiceHub
import java.util.*

class Admin(val adminId: UUID, serviceHub: AppServiceHub) : User(adminId, serviceHub) {

    fun updateOrganizationStatus() {}

    fun createUserAccount() {}

    fun updateUserStatus() {}
}