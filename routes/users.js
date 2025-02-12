import express from 'express'
const router = express.Router()

// User routes implementation
router.get('/', (req, res) => {
  res.json({ message: 'Users route' })
})

export default router
