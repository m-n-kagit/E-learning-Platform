import { rateLimit } from 'express-rate-limit'

const auth_limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // for 15 minutes the user can make 100 requests
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
})//ipv6Subnet is used to specify the subnet size for IPv6 addresses when applying rate limiting.

const login_limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // for 15 minutes the user can make 5 login attempts
    limit: 5, // Limit each IP to 5 login attempts per `window` (here, per 15 minutes)      
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
})

export default {auth_limiter, login_limiter}