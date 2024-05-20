package com.deqode.webserver.security

import com.deqode.webserver.entity.ErrorResponse
import com.deqode.webserver.entity.SerializedPublicUserAccountInfoState
import com.fasterxml.jackson.databind.ObjectMapper
import com.google.gson.Gson
import net.corda.core.contracts.UniqueIdentifier
import org.springframework.http.HttpStatus
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter
import org.springframework.web.client.RestTemplate
import java.util.*
import javax.servlet.FilterChain
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import kotlin.NullPointerException

class PreAuthenticatedProcessingFilter(private val host: String,
                                       private val port: Int): AbstractPreAuthenticatedProcessingFilter() {

    override fun getPreAuthenticatedCredentials(request: HttpServletRequest): Any {
        return "NA"
    }

    override fun getPreAuthenticatedPrincipal(request: HttpServletRequest): Any {

        val username = request.getHeader("username") ?: throw NullPointerException("Authorization is required")

        val role = getUserRole(username) ?: throw Exception("Role not found for user: $username")
        val grantedAuthority = arrayOfNulls<GrantedAuthority>(1)
        grantedAuthority[0] = SimpleGrantedAuthority(role)
        val authorities: MutableCollection<GrantedAuthority?> = ArrayList()
        authorities.add(grantedAuthority[0])
        return authorities
    }

    override fun doFilter(request: ServletRequest?, response: ServletResponse?, chain: FilterChain?) {

        val res = response as? HttpServletResponse
        try{
            super.doFilter(request, response, chain)
            return
        }catch (e: NullPointerException){
            val errorResponse = ErrorResponse(HttpStatus.UNAUTHORIZED.value(),
                    "UNAUTHORIZED", "UNAUTHORIZED")
            res?.status = HttpStatus.UNAUTHORIZED.value()
            res?.writer?.write(Gson().toJson(errorResponse))
        }
        catch (e: Exception){
            println(e)
            val errorResponse = ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                    e.message!!, e.message!!)
            res?.status = HttpStatus.BAD_REQUEST.value()
            res?.writer?.write(Gson().toJson(errorResponse))
        }
    }
    private fun getUserRole(username: String): String? {

        val userId: UUID = UniqueIdentifier.fromString(username).id

        try {
            val uri = "http://$host:$port/users/spring-boot/${username}"

            val restTemplate = RestTemplate()
            val result = restTemplate.getForEntity(uri, String::class.java)

            val mapper = ObjectMapper()
            val publicUserAccountInfoState = mapper.readValue("{${result.body}}", SerializedPublicUserAccountInfoState::class.java)

            return publicUserAccountInfoState.role.toString()
        } catch (e: Exception) {
            throw Exception("User not found $userId")
        }
    }
}