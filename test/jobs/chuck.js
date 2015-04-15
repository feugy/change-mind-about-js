import {expect} from 'chai';
import job, {Sorter, Crawler} from '../../src/jobs/chuck';

describe('Chuck Norris\'s Job', () => {

  describe('Sorter', () => {

    it('should be serialized into string', () => {
      expect(new Sorter().toString()).to.equal('Sorter');
    });

    it('should sort incoming quotations', done => {
      let data = [
        {points: 5, fact: 'Rien ne sert de jouer aux échecs avec Chuck Norris, il ne connait pas l\'échec.'},
        {points: 10, fact: 'Chuck Norris a gagné la guerre du Golf, en 18 trous.'},
        {points: -3, fact: 'Chuck Norris ne prends jamais de laxatif; personne ne fait chier Chuck Norris !'}
      ];
      new Sorter().run({data}, (err, results) => {
        expect(err).not.to.exist;
        expect(results).to.have.property('data').that.deep.equals([data[1]]);
        done();
      });
    });

    it('should sort no data', done => {
      new Sorter().run((err, results) => {
        expect(err).not.to.exist;
        expect(results).to.have.property('data').that.is.empty;
        done();
      });
    });

    it('should sort empty data', done => {
      new Sorter().run({data: []}, (err, results) => {
        expect(err).not.to.exist;
        expect(results).to.have.property('data').that.is.empty;
        done();
      });
    });
  });

  describe('Crawler', () => {

    it('should be serialized into string', () => {
      expect(new Crawler(10).toString()).to.equal('Crawler page 10');
    });

    it('should handle API errors', done => {
      new Crawler(-1).run((err, results) => {
        expect(err).to.exist.and.to.have.property('message').that.include('Invalid argument');
        expect(results).not.to.exist;
        done();
      });
    });

    it('should return a limited number of quotes', done => {
      let crawler = new Crawler(1);
      let number = 2;
      crawler.number = number;
      crawler.run((err, results) => {
        expect(err).not.to.exist;
        expect(results).to.have.property('data').that.has.lengthOf(number);
        done();
      });
    });
  });
});
