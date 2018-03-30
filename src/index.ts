import SubMarine from "./main";

var submarine = new SubMarine();

submarine.get(SubMarine.ORIGINS.SUBDIVX, 'Heroes s01e03', 'blueray')
  .then(subs => {
    console.log("Total length: ", subs.length);
  });