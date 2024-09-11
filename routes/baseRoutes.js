const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Corelink Backend');
});

module.exports = router;