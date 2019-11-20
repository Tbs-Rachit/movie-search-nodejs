const request = require('supertest')
const app = require('../routes')
var async = require("async")

describe('Movie Endpoints', () => {
    it('should search a new movie', async () => {
        const res = await request(app)
            .post('/api/search')
            .send({
                movie_name: 'Comedy',
                movie_time: '19:30'
            })
        //console.log(res)
        expect(res.statusCode).toEqual(200)
    })
})