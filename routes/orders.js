import express from 'express'
const router = express.Router()

// Order routes implementation
router.get('/', (req, res) => {
  res.json({ message: 'Orders route' })
})

export default router
