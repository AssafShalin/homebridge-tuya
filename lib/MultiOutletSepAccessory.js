const BaseAccessory = require('./BaseAccessory');
const async = require('async');

class MultiOutletSepAccessory extends BaseAccessory {
    static getCategory(Categories) {
        return Categories.LIGHTBULB;
    }

    constructor(...props) {
        super(...props);
    }

    _registerPlatformAccessory() {
        const {Service} = this.hap;
        const deviceIndex = this.device.context.index;
        this.accessory.addService(Service.Lightbulb, `${this.device.context.name}-${deviceIndex}`);

        super._registerPlatformAccessory();
    }

    _registerCharacteristics(dps) {
        const {Service, Characteristic} = this.hap;
        const service = this.accessory.getService(Service.Lightbulb);
        const deviceIndex = this.device.context.index;
        this._checkServiceName(service, `${this.device.context.name}-${deviceIndex}`);
        const characteristicOn = service.getCharacteristic(Characteristic.On)
                .updateValue(dps[deviceIndex + 1])
                .on('get', (callback) => {
                    this.getState(deviceIndex+1, callback);
                })
                .on('set', (callback) => {
                    this.setState(deviceIndex+1, callback);
                });

        this.device.on('change', (changes, state) => {
            characteristicOn.updateValue(state[deviceIndex + 1])
        });
    }
}

module.exports = MultiOutletSepAccessory;