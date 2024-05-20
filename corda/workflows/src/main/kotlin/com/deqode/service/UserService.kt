package com.deqode.service

import com.deqode.schemas.PublicUserAccountInfoSchemaV1.PersistentPublicUserAccountInfo
import com.deqode.schemas.UserRole
import com.deqode.schemas.UserStatus
import com.deqode.states.PublicUserAccountInfoState
import net.corda.core.contracts.StateAndRef
import net.corda.core.flows.FlowException
import net.corda.core.node.AppServiceHub
import net.corda.core.node.services.CordaService
import net.corda.core.node.services.queryBy
import net.corda.core.node.services.vault.Builder.equal
import net.corda.core.node.services.vault.QueryCriteria
import net.corda.core.serialization.SingletonSerializeAsToken
import net.corda.core.utilities.contextLogger
import java.util.*
import java.util.regex.Pattern

@CordaService
class UserService(val service: AppServiceHub) : SingletonSerializeAsToken() {
    companion object {
        val logger = contextLogger()
    }

    fun getActiveUserAccountByUserId(userId: UUID): StateAndRef<PublicUserAccountInfoState>? {
        val idSelector = PersistentPublicUserAccountInfo::id.equal(userId)
        val statusSelector = PersistentPublicUserAccountInfo::status.equal(UserStatus.ACTIVE)
        val idCriteria = QueryCriteria.VaultCustomQueryCriteria(idSelector)
        val statusCriteria = QueryCriteria.VaultCustomQueryCriteria(statusSelector)
        val customCriteria = idCriteria.and(statusCriteria)
        return service.vaultService.queryBy<PublicUserAccountInfoState>(
                criteria = customCriteria).states.firstOrNull()
    }

    fun getUserAccountByUserId(userId: UUID): StateAndRef<PublicUserAccountInfoState>? {
        val idSelector = PersistentPublicUserAccountInfo::id.equal(userId)
        val idCriteria = QueryCriteria.VaultCustomQueryCriteria(idSelector)
        return service.vaultService.queryBy<PublicUserAccountInfoState>(
                criteria = idCriteria).states.firstOrNull()
    }

    fun getOrgIdByUserId(userId: UUID): UUID {
        val publicUserAccountInfoState = getActiveUserAccountByUserId(userId)
                ?: throw FlowException("Doc owner id $userId does not match")
        return publicUserAccountInfoState.state.data.organizationId

    }

    fun isAdminOrg(publicUserAccountInfoState: PublicUserAccountInfoState,
                   docOrgId: UUID): Boolean {
        return publicUserAccountInfoState.role == UserRole.ADMIN && publicUserAccountInfoState.organizationId == docOrgId
    }

    fun getOrgAdmin(userId: UUID): PublicUserAccountInfoState {
        val userAccount = getActiveUserAccountByUserId(userId) ?: throw FlowException("User " +
                "not found")
        val orgSelector = PersistentPublicUserAccountInfo::organizationId.equal(userAccount.state.data.organizationId)
        val roleSelector = PersistentPublicUserAccountInfo::role.equal(UserRole.ADMIN)
        val orgCriteria = QueryCriteria.VaultCustomQueryCriteria(orgSelector)
        val roleCriteria = QueryCriteria.VaultCustomQueryCriteria(roleSelector)
        val customCriteria = orgCriteria.and(roleCriteria)
        val admin = service.vaultService.queryBy<PublicUserAccountInfoState>(
                criteria = customCriteria).states.firstOrNull()
                ?: throw FlowException("Admin not found")
        return admin.state.data
    }

    fun isUserAndAdminFromSameOrg(userState:PublicUserAccountInfoState,
                                  adminState: PublicUserAccountInfoState): Boolean {
        return userState.organizationId == adminState.organizationId
    }

    fun isValidEmailAddress(email: String) {
        val isValidEmail = Pattern.compile(
                "^(([\\w-]+\\.)+[\\w-]+|([a-zA-Z]|[\\w-]{2,}))@"
                        + "((([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\\.([0-1]?"
                        + "[0-9]{1,2}|25[0-5]|2[0-4][0-9])\\."
                        + "([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\\.([0-1]?"
                        + "[0-9]{1,2}|25[0-5]|2[0-4][0-9]))|"
                        + "([a-zA-Z]+[\\w-]+\\.)+[a-zA-Z]{2,4})$"
        ).matcher(email).matches()

        if (!isValidEmail) {
            throw FlowException("Not a valid email address")
        }
    }

    fun isEmailUnique(email: String) {
        getAccountByEmail(email) ?: return
        throw FlowException("An account already exists with this email")
    }

    fun getAccountByEmail(email: String): StateAndRef<PublicUserAccountInfoState>? {
        val selector = PersistentPublicUserAccountInfo::email.equal(email)
        val customCriteria = QueryCriteria.VaultCustomQueryCriteria(selector)
        return service.vaultService.queryBy<PublicUserAccountInfoState>(
                criteria = customCriteria).states.firstOrNull()
    }

}
