describe("Core utils tests", function() {

  beforeEach(function() {});
  afterEach(function() {});

  it("colorToInt parses red", function() {
    var RED = 4278190335;

    expect(pxtr.utils.colorToInt("red")).toBe(RED);
    expect(pxtr.utils.colorToInt("rgb(255,0,0)")).toBe(RED);
    expect(pxtr.utils.colorToInt("rgba(255,0,0,1)")).toBe(RED);
    expect(pxtr.utils.colorToInt("#FF0000")).toBe(RED);
    expect(pxtr.utils.colorToInt("#ff0000")).toBe(RED);
    expect(pxtr.utils.colorToInt("#f00")).toBe(RED);
    expect(pxtr.utils.colorToInt("#f00")).toBe(RED);
  });

  it("colorToInt parses white", function() {
    var WHITE = 4294967295;

    expect(pxtr.utils.colorToInt("white")).toBe(WHITE);
    expect(pxtr.utils.colorToInt("rgb(255,255,255)")).toBe(WHITE);
    expect(pxtr.utils.colorToInt("rgba(255,255,255,1)")).toBe(WHITE);
    expect(pxtr.utils.colorToInt("#FFFFFF")).toBe(WHITE);
    expect(pxtr.utils.colorToInt("#ffffff")).toBe(WHITE);
    expect(pxtr.utils.colorToInt("#FFF")).toBe(WHITE);
    expect(pxtr.utils.colorToInt("#fff")).toBe(WHITE);
  });

  it("colorToInt parses transparent", function() {
    var TRANSPARENT = 0;

    expect(pxtr.utils.colorToInt("transparent")).toBe(TRANSPARENT);
    expect(pxtr.utils.colorToInt("rgba(100,120,150, 0)")).toBe(TRANSPARENT);
    expect(pxtr.utils.colorToInt("rgba(255,255,255,0)")).toBe(TRANSPARENT);
  });
});