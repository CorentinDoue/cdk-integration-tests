import { beforeEach, describe, it, expect } from "vitest";
import {
  Config,
  setupConfigAsIntegrationTest,
  setupConfigAsUnitTest,
  useTestDownConfig,
  useTestUpConfig,
} from "./index";

describe("Config", () => {
  beforeEach(() => {
    delete process.env.CONFIG_MODE;
    delete process.env.CONFIG_USE_TEST_UP;
  });

  it("throws if the env var if not defined without context", () => {
    // @ts-expect-error TOTO is not a known env var
    expect(() => Config.TOTO0).toThrow("Cannot use Config");
  });

  describe("when the value is defined", () => {
    it("returns the env var value if defined without context", () => {
      process.env.TOTO1 = "toto1";
      // @ts-expect-error TOTO is not a known env var
      expect(Config.TOTO1).toBe("toto1");
    });
    it("returns the env var value if defined in a unit test context", () => {
      setupConfigAsUnitTest();
      process.env.TOTO2 = "toto2";
      // @ts-expect-error TOTO is not a known env var
      expect(Config.TOTO2).toBe("toto2");
    });
    it("returns the env var value if defined in a integration test context", () => {
      setupConfigAsIntegrationTest();
      process.env.TOTO3 = "toto3";
      // @ts-expect-error TOTO is not a known env var
      expect(Config.TOTO3).toBe("toto3");
    });
  });

  it("returns a dummy value in a unit test context ", () => {
    setupConfigAsUnitTest();
    // @ts-expect-error TOTO is not a known env var
    expect(Config.TOTO4).toBe("NeverUsed");
  });

  describe("in integration test context", () => {
    beforeEach(() => {
      setupConfigAsIntegrationTest();
    });

    it("returns the test downstream env var value if defined", () => {
      process.env.CONFIG_TEST_DOWN_TOTO5 = "downToto5";
      // @ts-expect-error TOTO is not a known env var
      expect(Config.TOTO5).toBe("downToto5");
    });
    it("throws if the test downstream env var if not defined", () => {
      // @ts-expect-error TOTO is not a known env var
      expect(() => Config.TOTO6).toThrow("Fail to load test downstream value");
    });
    it("returns the test upstream env var value if defined and useTestUpConfig have been called", () => {
      process.env.CONFIG_TEST_UP_TOTO7 = "upToto7";
      useTestUpConfig();
      // @ts-expect-error TOTO is not a known env var
      expect(Config.TOTO7).toBe("upToto7");
    });
    it("throws if the test upstream env var if not defined and useTestUpConfig have been called", () => {
      useTestUpConfig();
      // @ts-expect-error TOTO is not a known env var
      expect(() => Config.TOTO8).toThrow("Fail to load test upstream value");
    });
    it("returns the test downstream env var value if defined and useTestDownConfig have been called after useTestUpConfig", () => {
      process.env.CONFIG_TEST_DOWN_TOTO9 = "downToto9";
      useTestUpConfig();
      useTestDownConfig();
      // @ts-expect-error TOTO is not a known env var
      expect(Config.TOTO9).toBe("downToto9");
    });
  });

  describe("testUp explicit shortcut", () => {
    it("throws if called without context", () => {
      // @ts-expect-error TOTO is not a known env var
      expect(() => Config.testUp.TOTO10).toThrow(
        "Please use Config.testUp in integration tests context"
      );
    });
    it("throws if called in unit test context", () => {
      setupConfigAsUnitTest();
      // @ts-expect-error TOTO is not a known env var
      expect(() => Config.testUp.TOTO11).toThrow(
        "Please use Config.testUp in integration tests context"
      );
    });
    it("returns the test upstream env var value if defined in integration tests context", () => {
      process.env.CONFIG_TEST_UP_TOTO12 = "upToto12";
      setupConfigAsIntegrationTest();
      // @ts-expect-error TOTO is not a known env var
      expect(Config.testUp.TOTO12).toBe("upToto12");
    });
    it("throws if the test upstream env var if not defined in integration tests context", () => {
      setupConfigAsIntegrationTest();
      // @ts-expect-error TOTO is not a known env var
      expect(() => Config.testUp.TOTO13).toThrow(
        "Fail to load test upstream value"
      );
    });
  });

  describe("testDown explicit shortcut", () => {
    it("throws if called without context", () => {
      // @ts-expect-error TOTO is not a known env var
      expect(() => Config.testDown.TOTO14).toThrow(
        "Please use Config.testDown in integration tests context"
      );
    });
    it("throws if called in unit test context", () => {
      setupConfigAsUnitTest();
      // @ts-expect-error TOTO is not a known env var
      expect(() => Config.testDown.TOTO15).toThrow(
        "Please use Config.testDown in integration tests context"
      );
    });
    it("returns the test downstream env var value if defined in integration tests context", () => {
      process.env.CONFIG_TEST_DOWN_TOTO16 = "downToto16";
      setupConfigAsIntegrationTest();
      // @ts-expect-error TOTO is not a known env var
      expect(Config.testDown.TOTO16).toBe("downToto16");
    });
    it("returns the test downstream env var value if defined in integration tests context even if useTestUpConfig is used", () => {
      process.env.CONFIG_TEST_DOWN_TOTO17 = "downToto17";
      setupConfigAsIntegrationTest();
      useTestUpConfig();
      // @ts-expect-error TOTO is not a known env var
      expect(Config.testDown.TOTO17).toBe("downToto17");
    });
    it("throws if the test downstream env var if not defined in integration tests context", () => {
      setupConfigAsIntegrationTest();
      // @ts-expect-error TOTO is not a known env var
      expect(() => Config.testDown.TOTO18).toThrow(
        "Fail to load test downstream value"
      );
    });
  });
});
