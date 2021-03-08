import { Event } from '../src'

test("on-off", () => {
  const event = new Event();
  event.on("hello", console.log);
  expect(event.off("hello", console.log)).toBeTruthy();
  expect(event.off("hello", console.log)).not.toBeTruthy();
})

test("once-off", () => {
  const event = new Event();
  event.once("hello", console.log);
  expect(event.off("hello", console.log)).toBeTruthy();
  expect(event.off("hello", console.log)).not.toBeTruthy();
})

test("on-emit", () => {
  let test = false;
  let testArgs = 0;
  function setTestForTrue(arg1: number) {
    test = true;
    testArgs = arg1;
  }

  const event = new Event();
  event.on("set-test-for-true", setTestForTrue);
  event.emit("set-test-for-true", 1)

  expect(test).toEqual(true)
  expect(testArgs).toEqual(1);
})