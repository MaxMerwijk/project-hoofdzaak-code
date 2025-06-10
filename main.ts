const HELMET_IDS: number[] = [1, 2, 3, 4, 5]
const DETECTION_CONFIRMATION_THRESHOLD: number = 3
const DISAPPEARANCE_CONFIRMATION_THRESHOLD: number = 5
const LOOP_PAUSE_MS: number = 100

let confirmedHelmetState: boolean = false
let detectionCounter: number = 0
let disappearanceCounter: number = 0

maqueenPlusV2.I2CInit()
huskylens.initI2c()

huskylens.initMode(protocolAlgorithm.OBJECTCLASSIFICATION)

music.setVolume(120)
radio.setGroup(1)

basic.showIcon(IconNames.No)
maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.AllLed, maqueenPlusV2.MyEnumSwitch.Close)

function getRawHelmetVisibility(): boolean {
    for (let id of HELMET_IDS) {
        if (huskylens.isLearned(id) && huskylens.isAppear(id, HUSKYLENSResultType_t.HUSKYLENSResultBlock)) {
            return true
        }
    }
    return false
}

basic.forever(function () {
    huskylens.request()
    let isRawHelmetVisible = getRawHelmetVisibility()

    if (isRawHelmetVisible) {
        disappearanceCounter = 0 
        detectionCounter++

        if (detectionCounter >= DETECTION_CONFIRMATION_THRESHOLD) {
            if (!confirmedHelmetState) { //
                confirmedHelmetState = true
                basic.showIcon(IconNames.Yes)
                maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
                maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.AllLed, maqueenPlusV2.MyEnumSwitch.Open) 
                music.startMelody(music.builtInMelody(Melodies.BaDing), MelodyOptions.OnceInBackground)
            }
            detectionCounter = DETECTION_CONFIRMATION_THRESHOLD
        }
    } else {
        detectionCounter = 0
        disappearanceCounter++

        if (disappearanceCounter >= DISAPPEARANCE_CONFIRMATION_THRESHOLD) {
            if (confirmedHelmetState) {
                confirmedHelmetState = false
                basic.showIcon(IconNames.No)
                maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
                maqueenPlusV2.controlLED(maqueenPlusV2.MyEnumLed.AllLed, maqueenPlusV2.MyEnumSwitch.Close) // LEDs OFF
            }
            disappearanceCounter = DISAPPEARANCE_CONFIRMATION_THRESHOLD
        }
    }

    if (confirmedHelmetState) {
        radio.sendString("1")
    } else {
        radio.sendString("0")
    }

    basic.pause(LOOP_PAUSE_MS)
})