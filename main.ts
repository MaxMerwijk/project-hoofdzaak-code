1105// ---------- VARIABLES ----------
let helmetDetected: boolean = false
let manualControlActive: boolean = false
let lastGamepadCommandTime: number = 0
const GAMEPAD_TIMEOUT_MS: number = 1000 // If no command for 1 sec, assume gamepad is idle

// ---------- CONSTANTS ----------
const HELMET_IDS: number[] = [1, 2, 3, 4] // << Adjust to match your helmet IDs

// ---------- INITIALIZATION ----------
maqueenPlusV2.I2CInit()
huskylens.initI2c()
huskylens.initMode(protocolAlgorithm.OBJECTCLASSIFICATION)
radio.setGroup(1)
basic.showIcon(IconNames.Happy)

// ---------- HELPER FUNCTION ----------
function isAnyHelmetDetected(): boolean {
    for (let id of HELMET_IDS) {
        if (huskylens.isLearned(id) && huskylens.isAppear(id, HUSKYLENSResultType_t.HUSKYLENSResultBlock)) {
            return true
        }
    }
    return false
}

// ---------- MAIN LOOP ----------
basic.forever(function () {
    huskylens.request()

    let helmetNowDetected = isAnyHelmetDetected()

    if (helmetNowDetected && !helmetDetected) {
        helmetDetected = true
        maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
        maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.AllLed, maqueenPlusV2.MyEnumSwitch.Open)
        basic.showIcon(IconNames.No)
    } else if (!helmetNowDetected && helmetDetected) {
        helmetDetected = false
        maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.AllLed, maqueenPlusV2.MyEnumSwitch.Close)
        basic.clearScreen()
    }

    if (!helmetDetected && manualControlActive && (input.runningTime() - lastGamepadCommandTime > GAMEPAD_TIMEOUT_MS)) {
        manualControlActive = false
        maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
        basic.showIcon(IconNames.Asleep)
    }

    if (!helmetDetected && !manualControlActive) {
        maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
    }

    basic.pause(50)
})

// ---------- RADIO RECEPTION (from Gamepad) ----------
radio.onReceivedString(function (receivedString: string) {
    lastGamepadCommandTime = input.runningTime()
    manualControlActive = true

    if (helmetDetected) {
        maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
        basic.showIcon(IconNames.No)
        return
    }

    basic.showLeds(`
        . . . . .
        . . # . .
        . # . # .
        . . # . .
        . . . . .
    `)

    if (receivedString == "F") {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.AllMotor, maqueenPlusV2.MyEnumDir.Forward, 150)
    } else if (receivedString == "B") {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.AllMotor, maqueenPlusV2.MyEnumDir.Backward, 150)
    } else if (receivedString == "L") {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Backward, 100)
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Forward, 100)
    } else if (receivedString == "R") {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Forward, 100)
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Backward, 100)
    } else if (receivedString == "S") {
        maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
    } else if (receivedString == "LED_L_ON") {
        maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.LeftLed, maqueenPlusV2.MyEnumSwitch.Open)
    } else if (receivedString == "LED_L_OFF") {
        maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.LeftLed, maqueenPlusV2.MyEnumSwitch.Close)
    } else if (receivedString == "LED_R_ON") {
        maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.RightLed, maqueenPlusV2.MyEnumSwitch.Open)
    } else if (receivedString == "LED_R_OFF") {
        maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.RightLed, maqueenPlusV2.MyEnumSwitch.Close)
    }
})
