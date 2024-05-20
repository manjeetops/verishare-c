package com.deqode.service

import com.deqode.schemas.OrganizationInfoSchemaV1.PersistentOrganizationInfo
import com.deqode.schemas.OrganizationStatus
import com.deqode.schemas.PublicUserAccountInfoSchemaV1.PersistentPublicUserAccountInfo
import com.deqode.schemas.UserRole
import com.deqode.states.OrganizationInfoState
import com.deqode.states.PublicUserAccountInfoState
import com.r3.corda.lib.accounts.contracts.states.AccountInfo
import com.r3.corda.lib.accounts.workflows.internal.accountService
import net.corda.core.contracts.StateAndRef
import net.corda.core.flows.FlowException
import net.corda.core.identity.Party
import net.corda.core.node.AppServiceHub
import net.corda.core.node.services.CordaService
import net.corda.core.node.services.Vault
import net.corda.core.node.services.queryBy
import net.corda.core.node.services.vault.Builder.equal
import net.corda.core.node.services.vault.PageSpecification
import net.corda.core.node.services.vault.QueryCriteria
import net.corda.core.serialization.SingletonSerializeAsToken
import net.corda.core.utilities.contextLogger
import java.security.PublicKey
import java.util.*

@CordaService
class OrganizationService(val serviceHub: AppServiceHub) : SingletonSerializeAsToken() {
    companion object {
        val logger = contextLogger()
    }

    fun checkOrgConstraints(nodePubKey: PublicKey, uniqueName: String) {
        val orgStates = serviceHub.vaultService.queryBy<OrganizationInfoState>().states

        orgStates.forEach { it ->
            if (it.state.data.host == nodePubKey) {
                throw FlowException("An Organization already exists on this node")
            }
            if (it.state.data.uniqueName == uniqueName) {
                throw FlowException("An Organization already exists with that " +
                        "name")
            }
        }
    }

    fun getCurrentOrganization(ourIdentity: Party): StateAndRef<OrganizationInfoState>? {
        val selector = PersistentOrganizationInfo::host.equal(ourIdentity.owningKey)
        val customCriteria = QueryCriteria.VaultCustomQueryCriteria(selector)
        return serviceHub.vaultService.queryBy<OrganizationInfoState>(
                criteria = customCriteria).states.firstOrNull()
    }

    fun getOrganization(orgId: UUID): StateAndRef<OrganizationInfoState> {
        val idSelector = PersistentOrganizationInfo::id.equal(orgId)
        val statusSelector = PersistentOrganizationInfo::status.equal(OrganizationStatus.ACTIVE)
        val idCriteria = QueryCriteria.VaultCustomQueryCriteria(idSelector)
        val statusCriteria = QueryCriteria.VaultCustomQueryCriteria(statusSelector)
        val customCriteria = idCriteria.and(statusCriteria)
        return serviceHub.vaultService.queryBy<OrganizationInfoState>(criteria = customCriteria).states.firstOrNull()
                ?: throw FlowException("Organization not found or Organization is inactive: $orgId")
    }

    fun getOrganizationDetails(orgId: UUID): OrganizationInfoState? {
        val idSelector = PersistentOrganizationInfo::id.equal(orgId)
        val idCriteria = QueryCriteria.VaultCustomQueryCriteria(idSelector)
        return serviceHub.vaultService.queryBy<OrganizationInfoState>(criteria =
        idCriteria).states.firstOrNull()?.state?.data
    }


    fun getOrganizationAdmin(orgId: UUID): StateAndRef<PublicUserAccountInfoState> {
        val idSelector = PersistentPublicUserAccountInfo::organizationId.equal(orgId)
        val roleSelector = PersistentPublicUserAccountInfo::role.equal(UserRole.ADMIN)

        val idCriteria = QueryCriteria.VaultCustomQueryCriteria(idSelector)
        val roleCriteria = QueryCriteria.VaultCustomQueryCriteria(roleSelector)

        val customCriteria = idCriteria.and(roleCriteria)
        return serviceHub.vaultService.queryBy<PublicUserAccountInfoState>(criteria = customCriteria).states.firstOrNull()
                ?: throw FlowException("Admin account not found: $orgId")
    }

    fun getOrgServiceAccount(orgId: UUID): StateAndRef<PublicUserAccountInfoState> {
        val idSelector = PersistentPublicUserAccountInfo::organizationId.equal(orgId)
        val roleSelector = PersistentPublicUserAccountInfo::role.equal(UserRole.SERVICE)

        val idCriteria = QueryCriteria.VaultCustomQueryCriteria(idSelector)
        val roleCriteria = QueryCriteria.VaultCustomQueryCriteria(roleSelector)

        val customCriteria = idCriteria.and(roleCriteria)
        return serviceHub.vaultService.queryBy<PublicUserAccountInfoState>(criteria = customCriteria).states.firstOrNull()
                ?: throw FlowException("Service account not found: $orgId")
    }

    fun getOrganizationUsers(ourIdentity: Party, pageNumber: Int = 1, pageSize: Int =
            10): Vault.Page<PublicUserAccountInfoState> {
        val organizationInfo = getCurrentOrganization(ourIdentity) ?: throw
        FlowException("Organization not found")
        val selector = PersistentPublicUserAccountInfo::organizationId.equal(organizationInfo.state.data.identifier.id)
        val customCriteria = QueryCriteria.VaultCustomQueryCriteria(selector)
        return serviceHub.vaultService.queryBy(
                criteria = customCriteria, paging = PageSpecification(pageNumber, pageSize))
    }

    fun getOrganizationUsers(organizationId: UUID, pageNumber: Int = 1, pageSize: Int =
            10): Vault.Page<PublicUserAccountInfoState> {
        getOrganization(organizationId)
        val selector = PersistentPublicUserAccountInfo::organizationId.equal(organizationId)
        val customCriteria = QueryCriteria.VaultCustomQueryCriteria(selector)
        return serviceHub.vaultService.queryBy(
                criteria = customCriteria, paging = PageSpecification(pageNumber, pageSize))
    }

    fun getOrganizationAccountInfoList(): List<StateAndRef<AccountInfo>> {
        return serviceHub.accountService.ourAccounts()
    }

    fun getEveryOneButNotaryAndMe(ourIdentity: Party): List<Party> {
        val everyone = serviceHub.networkMapCache.allNodes.flatMap { it.legalIdentities };
        return everyone.filter {
            serviceHub.networkMapCache
                    .isNotary(it).not()
        } - ourIdentity
    }

    fun getAllOrganizations(pageNumber: Int = 1, pageSize: Int = 10): Vault.Page<OrganizationInfoState> {
        return serviceHub.vaultService.queryBy<OrganizationInfoState>(PageSpecification
        (pageNumber, pageSize))
    }
}
