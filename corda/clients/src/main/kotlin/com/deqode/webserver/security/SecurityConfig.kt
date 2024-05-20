package com.deqode.webserver.security

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.builders.WebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken


private const val SPRING_NODE_HOST = "server.host"
private const val SPRING_NODE_PORT = "server.port"

@Configuration
open class SecurityConfig(@Value("\${${SPRING_NODE_HOST}}") private val host: String,
                          @Value("\${${SPRING_NODE_PORT}}") private val port: Int) : WebSecurityConfigurerAdapter() {


    // Add urls that do not require authorization
    override fun configure(web: WebSecurity) {

        web.ignoring()
                .antMatchers(HttpMethod.POST, "/organizations")
                .antMatchers(HttpMethod.GET, "/users/spring-boot/{userId}")
    }

    // Add urls that require authorization
    @Throws(Exception::class)
    override fun configure(http: HttpSecurity) {


        val filter = PreAuthenticatedProcessingFilter(host, port)

        filter.setAuthenticationManager { authentication ->
            @Suppress("UNCHECKED_CAST")
            val authorities = authentication.principal as? Collection<GrantedAuthority>
            authentication.isAuthenticated = true
            PreAuthenticatedAuthenticationToken(null, null, authorities)
        }

        //TODO: check for csrf token
        http
                .addFilter(filter)
                .csrf().disable()
                .authorizeRequests()
                .antMatchers(HttpMethod.PUT, "/organizations/{organizationId}").hasAuthority("ADMIN")
                .antMatchers(HttpMethod.GET, "/organizations/{organizationId}").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.GET, "/organizations").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.GET, "/organizations/{organizationId}/users").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.GET, "/organizations/{organizationId}/documents").hasAuthority("ADMIN")
                .antMatchers(HttpMethod.POST, "/users").hasAuthority("ADMIN")
                .antMatchers(HttpMethod.PUT, "/users/{userId}").hasAuthority("ADMIN")
                .antMatchers(HttpMethod.GET, "/users/{userId}").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.GET, "/users").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.GET, "/users/{userId}/documents").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.GET, "/users/{userId}/documents-permission").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.POST, "/documents").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.PUT, "/documents/{documentId}/version").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.POST, "/documents/{documentId}/share").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.POST, "/documents/{documentId}/transfer").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.PUT, "/documents/{documentId}/freeze").hasAuthority("ADMIN")
                .antMatchers(HttpMethod.DELETE, "/documents/{documentId}").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.PUT, "/documents/{documentId}").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.GET, "/documents/{documentId}").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.GET, "/documents/{documentId}/download").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.POST, "/documents/{documentId}/attestations").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.GET, "/documents/{documentId}/attestations").hasAnyAuthority("ADMIN", "USER")
                .antMatchers(HttpMethod.GET,
                        "/documents/{documentId}/request-attestations").hasAnyAuthority("ADMIN", "USER")
                .and()
                .httpBasic()

        http.sessionManagement() // dont create a session for this configuration
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
    }
}