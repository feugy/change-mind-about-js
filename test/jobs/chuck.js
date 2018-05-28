import { expect } from 'chai'
import { Sorter, Crawler } from '../../lib/jobs/chuck'

describe("Chuck Norris's Job", () => {
  describe('Sorter', () => {
    it('should be serialized into string', () => {
      expect(new Sorter().toString()).to.equal('Sorter')
    })

    it('should sort incoming quotations', async () => {
      const data = [
        {
          points: 5,
          fact:
            "Rien ne sert de jouer aux échecs avec Chuck Norris, il ne connait pas l'échec."
        },
        {
          points: 10,
          fact: 'Chuck Norris a gagné la guerre du Golf, en 18 trous.'
        },
        {
          points: -3,
          fact:
            'Chuck Norris ne prends jamais de laxatif personne ne fait chier Chuck Norris !'
        }
      ]
      expect(await new Sorter().run({ data }))
        .to.have.property('data')
        .that.deep.equals([data[1]])
    })

    it('should sort no data', async () => {
      expect(await new Sorter().run()).to.have.property('data').that.is.empty
    })

    it('should sort empty data', async () => {
      expect(await new Sorter().run({ data: [] })).to.have.property('data').that
        .is.empty
    })
  })

  describe('Crawler', () => {
    it('should be serialized into string', () => {
      expect(new Crawler({ page: 10 }).toString()).to.equal('Crawler page 10')
    })

    it.skip('should handle API errors', async () => {
      expect(async () =>
        new Crawler({ size: 'toto', type: 'bla' }).run()
      ).to.throw(/Invalid argument/)
    })

    it('should return a limited number of quotes', async () => {
      const page = 1
      const size = 2
      expect(await new Crawler({ page, size }).run())
        .to.have.property('data')
        .that.has.lengthOf(size)
    })
  })
})
