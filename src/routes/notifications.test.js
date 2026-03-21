const { serve } = require('../services/testing');
const dateService = require('../services/date');
const eventsResource = require('../resources/events');
const eventsMock = require('../mocks/events');
const emailService = require('../services/email');

describe('Notifications Routes', () => {
  function buildNotificationEmailMessage(){
    return `Cool! 4 new events have just been found.

O Pequeno Príncipe
2024-05-08 16:00
Balneário Camboriú, SC
https://www.eticketcenter.com.br/eventos/teatro/o-pequeno-principe-em-balneario-camboriu-sc/08-05/16-00/

Rogério Morgado - Show Solo
2024-03-09
Curitiba, PR
https://www.diskingressos.com.br/evento/6478/09-03-2024/pr/curitiba/rogerio-morgado-show-solo

Rota Da Seda
2024-07-06 21:00
Curitiba, PR
https://www.diskingressos.com.br/evento/6390/06-07-2024/pr/curitiba/rota-da-seda

Baile Da Gabi Noite Dos Solteiros
2024-03-09
Joinville, SC
https://www.sympla.com.br/evento/baile-da-gabi-noite-dos-solteiros/3355986`;
  }

  function filterMockedEventsByMinCreationDate(minCreationDate){
    return eventsMock.filter(({ created_at }) => created_at >= minCreationDate);
  }

  async function start(payload){
    return await serve().post('/notifications').set({ vwtoken: 'vee456' }).send(payload);
  }

  beforeEach(() => {
    dateService.buildTodayDateString = jest.fn(() => '2024-02-15');
    eventsResource.get = jest.fn(({ minCreationDate }) => {
      return Promise.resolve({ data: filterMockedEventsByMinCreationDate(minCreationDate) });
    });
    emailService.send = jest.fn(() => Promise.resolve({}));
  });

  it('should not allow notifications execution by default', async () => {
    const response = await serve().post('/notifications');
    expect(response.status).toEqual(401);
  });

  it('should notify recipients when new events are found', async () => {
    const response = await start();
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      duration: expect.any(Number),
      successes: 2,
      failures: 0
    });
    expect(emailService.send).toHaveBeenCalledWith({
      to: 'some@email.com',
      subject: '[2024-02-15] New events found!',
      message: buildNotificationEmailMessage()
    });
    expect(emailService.send).toHaveBeenCalledWith({
      to: 'other@email.com',
      subject: '[2024-02-15] New events found!',
      message: buildNotificationEmailMessage()
    });
    expect(emailService.send).toHaveBeenCalledTimes(2);
  });

  it('should not notify recipients when new events are not found', async () => {
    const response = await start({ minCreationDate: '2024-02-16' });
    expect(emailService.send).not.toHaveBeenCalled();
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ duration: expect.any(Number) });
  });

  it('should notify failures if notification email fails to send.', async () => {
    emailService.send = jest.fn(({ to }) => {
      return to == 'some@email.com' ? Promise.reject({ some: 'err' }) : Promise.resolve({});
    });
    const response = await start();
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      duration: expect.any(Number),
      successes: 1,
      failures: 1
    });
  });
});
