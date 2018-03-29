import Sub from "./subInterface";

interface OriginInterface {
  search(text: String):  Promise<Sub[]>;
}

export default OriginInterface;