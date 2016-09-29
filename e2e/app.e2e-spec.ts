import { AuroraHarmonizeAngularPage } from './app.po';

describe('aurora-harmonize-angular App', function() {
  let page: AuroraHarmonizeAngularPage;

  beforeEach(() => {
    page = new AuroraHarmonizeAngularPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
