package com.deqode.webserver.entity

data class ErrorResponse(private val status: Int,
                         private val message: String,
                         private val error: String)