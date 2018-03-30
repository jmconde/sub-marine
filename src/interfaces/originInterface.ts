import Sub from "./subInterface";

interface OriginInterface {
  search(text: String, tuneText?: String):  Promise<Sub[]>;
}

export default OriginInterface;