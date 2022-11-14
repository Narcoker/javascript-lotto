const App = require("../src/App");
const MissionUtils = require("@woowacourse/mission-utils");
const Person = require("../src/Person");
const { ERROR } = require('../src/Constants');
const { SYSTEM } = require("../src/System");

const mockQuestions = (answers) => {
  MissionUtils.Console.readLine = jest.fn();
  answers.reduce((acc, input) => {
    return acc.mockImplementationOnce((question, callback) => {
      callback(input);
    });
  }, MissionUtils.Console.readLine);
};

const mockRandoms = (numbers) => {
  MissionUtils.Random.pickUniqueNumbersInRange = jest.fn();
  numbers.reduce((acc, number) => {
    return acc.mockReturnValueOnce(number);
  }, MissionUtils.Random.pickUniqueNumbersInRange);
};

const getLogSpy = () => {
  const logSpy = jest.spyOn(MissionUtils.Console, "print");
  logSpy.mockClear();
  return logSpy;
};

describe("로또 테스트", () => {
  test("기능 테스트", () => {
    mockRandoms([
      [8, 21, 23, 41, 42, 43],
      [3, 5, 11, 16, 32, 38],
      [7, 11, 16, 35, 36, 44],
      [1, 8, 11, 31, 41, 42],
      [13, 14, 16, 38, 42, 45],
      [7, 11, 30, 40, 42, 43],
      [2, 13, 22, 32, 38, 45],
      [1, 3, 5, 14, 22, 45],
    ]);
    mockQuestions(["8000", "1,2,3,4,5,6", "7"]);
    const logs = [
      "8개를 구매했습니다.",
      "[8, 21, 23, 41, 42, 43]",
      "[3, 5, 11, 16, 32, 38]",
      "[7, 11, 16, 35, 36, 44]",
      "[1, 8, 11, 31, 41, 42]",
      "[13, 14, 16, 38, 42, 45]",
      "[7, 11, 30, 40, 42, 43]",
      "[2, 13, 22, 32, 38, 45]",
      "[1, 3, 5, 14, 22, 45]",
      "3개 일치 (5,000원) - 1개",
      "4개 일치 (50,000원) - 0개",
      "5개 일치 (1,500,000원) - 0개",
      "5개 일치, 보너스 볼 일치 (30,000,000원) - 0개",
      "6개 일치 (2,000,000,000원) - 0개",
      "총 수익률은 62.5%입니다.",
    ];
    const logSpy = getLogSpy();
    const app = new App();
    app.play();
    logs.forEach((log) => {
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(log));
    });
  });

  test("예외 테스트", () => {
    mockQuestions(["1000j"]);
    expect(() => {
      const app = new App();
      app.play();
    }).toThrow("[ERROR]");
  });

  test("예외 테스트: 현금이 1,000원으로 나누어 떨어지지 않는 경우 1", () => {
    expect(() => {
      const person = new Person();
      person.isCorrectCash("1234");
    }).toThrow(ERROR.INVAID_CASH);
  });

  test("예외 테스트: 현금이 1,000원으로 나누어 떨어지지 않는 경우 2", () => {
    expect(() => {
      const person = new Person();
      person.isCorrectCash("123");
    }).toThrow(ERROR.INVAID_CASH);
  });

  test("예외 테스트: 현금 값이 0인 경우", () => {
    expect(() => {
      const person = new Person();
      person.isCorrectCash("0");
    }).toThrow(ERROR.CASH_IS_ZERO);
  });

  test("예외 테스트: 현금 값이 음수인 경우", () => {
    expect(() => {
      const person = new Person();
      person.isCorrectCash("-1");
    }).toThrow(ERROR.CASH_IS_NOT_NATURAL_NUMBER);
  });

  test("기능 테스트: 금액에 맞는 개수 만큼 로또 생성", () => {
    const logs = [
      "3개를 구매했습니다.",
      "[1, 2, 3, 5, 42, 43]",
      "[2, 4, 8, 16, 38, 44]",
      "[5, 7, 8, 10, 11, 12]",
    ];
    mockRandoms([
      [1, 2, 3, 5, 42, 43],
      [2, 4, 8, 16, 38, 44],
      [5, 7, 8, 10, 11, 12],
    ]);
    const logSpy = getLogSpy();

    const cash = '3000';
    SYSTEM.publishLotto(cash);

    logs.forEach((log) => {

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(log));
    });
  });

});
