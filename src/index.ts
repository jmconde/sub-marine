import SubMarine from "./main";

var submarine = new SubMarine();

submarine.get(SubMarine.ORIGINS.SUBDIVX, 'Heroes s01e02', '')
  .then(subs => {
    console.log(subs);
    console.log("Total length: ", subs.length);
  });