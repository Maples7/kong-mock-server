module.exports = {
  '/': (req, res, next) =>
    res.json({
      data: [
        {
          address: '1.2.3.4:7946',
          name: '064f9f98619d_0.0.0.0:7946_d5593e0d422840519b0ec828a73af045',
          status: 'alive'
        }
      ],
      total: 1
    })
};
