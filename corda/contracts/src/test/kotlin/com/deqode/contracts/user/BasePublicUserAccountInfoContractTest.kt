package com.deqode.contracts.user

import com.deqode.contracts.BaseContractTest
import com.deqode.contracts.PublicUserAccountInfoContract
import com.deqode.schemas.UserRole
import com.deqode.schemas.UserStatus
import com.deqode.states.PublicUserAccountInfoState
import net.corda.core.contracts.UniqueIdentifier

open class BasePublicUserAccountInfoContractTest: BaseContractTest() {

    val PUBLIC_USER_ACCOUNT_INFO_CONTRACT_ID = PublicUserAccountInfoContract.ID


    val create = PublicUserAccountInfoContract.Commands.Create()
    val update = PublicUserAccountInfoContract.Commands.Update()
    val createOrgUsers = PublicUserAccountInfoContract.Commands.CreateOrgUsers()

    fun getInputAdminAccountInfoState(): PublicUserAccountInfoState {
        return PublicUserAccountInfoState(UniqueIdentifier().id, UniqueIdentifier().id, "admin@deqode.com",
                "admin first name", "admin last name", UserStatus.INACTIVE, UserRole.ADMIN,
                partyA.publicKey, listOf())
    }

    fun getOutputAdminAccountInfoState(): PublicUserAccountInfoState {
        return PublicUserAccountInfoState(UniqueIdentifier().id, UniqueIdentifier().id, "admin@deqode.com",
                "admin first name", "admin last name", UserStatus.ACTIVE, UserRole.ADMIN,
                partyA.publicKey, listOf())
    }

    fun getInputServiceAccountInfoState(): PublicUserAccountInfoState {
        return PublicUserAccountInfoState(UniqueIdentifier().id, UniqueIdentifier().id, "service@deqode.com",
                "service first name", "service last name", UserStatus.INACTIVE, UserRole.SERVICE,
                partyA.publicKey, listOf())
    }

    fun getOutputServiceAccountInfoState(): PublicUserAccountInfoState {
        return PublicUserAccountInfoState(UniqueIdentifier().id, UniqueIdentifier().id, "service@deqode.com",
                "service first name", "service last name", UserStatus.ACTIVE, UserRole.SERVICE,
                partyA.publicKey, listOf())
    }

    fun getInputUserAccountInfoState(): PublicUserAccountInfoState {
        return PublicUserAccountInfoState(UniqueIdentifier().id, UniqueIdentifier().id, "user@deqode.com",
                "user first name", "user last name", UserStatus.INACTIVE, UserRole.USER,
                partyA.publicKey, listOf())
    }

    fun getOutputUserAccountInfoState(): PublicUserAccountInfoState {
        return PublicUserAccountInfoState(UniqueIdentifier().id, UniqueIdentifier().id, "user@deqode.com",
                "user first name", "user last name", UserStatus.ACTIVE, UserRole.USER,
                partyA.publicKey, listOf())
    }
}