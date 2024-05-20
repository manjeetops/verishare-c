package com.deqode.webserver.entity

import com.deqode.schemas.UserRole
import com.deqode.schemas.UserStatus
import java.io.Serializable
import java.util.*

data class SerializedPublicUserAccountInfoState(val id: UUID? = null,
                                               val organizationId: UUID? = null,
                                               val email: String? = null,
                                               val firstName: String? = null,
                                               val lastName: String? = null,
                                               val status: UserStatus? = null,
                                               val role: UserRole? = null,
                                               val adminPublicKey: String? = null,
                                               val parties: List<String>? = null) : Serializable