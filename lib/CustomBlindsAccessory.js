const BaseAccessory = require('./BaseAccessory');

class CustomBlindsAccessory extends BaseAccessory {
    static getCategory(Categories) {
        return Categories.SWITCH;
    }

    constructor(...props) {
        super(...props);
    }

    _registerPlatformAccessory() {
        const {Service} = this.hap;
        this.accessory.addService(this.hap.Service.Outlet, `${this.device.context.name}`, 'Open');
        this.accessory.addService(this.hap.Service.Outlet, `${this.device.context.name}`, 'Close');

        super._registerPlatformAccessory();
    }

    _registerCharacteristics(dps) {
        const {Service, Characteristic} = this.hap;
        const service = this.accessory.getService(Service.Outlet);
        const openService = this.accessory.getServiceByUUIDAndSubType(Service.Outlet, 'Open');
        const closeService = this.accessory.getServiceByUUIDAndSubType(Service.Outlet, 'Close');
        this._checkServiceName(openService, this.device.context.name);
        this._checkServiceName(closeService, this.device.context.name);

        this.dpAction = this._getCustomDP(this.device.context.dpAction) || '1';

        const characteristicOpen = openService.getCharacteristic(Characteristic.On)
                                               .updateValue(dps[1] === 'close')
                                               .on('get', (callback) => {
                                                    callback(null, this.device.state[1] === 'close')
                                                })
                                                .on('set', (value, callback) => {
                                                    if(value) {
                                                        this.setState(1, 'close', callback);
                                                    } else {
                                                        this.setState(1, 'stop', callback);
                                                    }
                                                });;

        const characteristicClose = closeService.getCharacteristic(Characteristic.On)
                                               .updateValue(dps[1] === 'open')
                                               .on('get', (callback) => {
                                                    callback(null, this.device.state[1] === 'open')
                                                })
                                                .on('set', (value, callback) => {
                                                    if(value) {
                                                        this.setState(1, 'open', callback);
                                                    } else {
                                                        this.setState(1, 'stop', callback);
                                                    }
                                                });;
        
        this.device.on('change', changes => {
            if(changes[1] === 'open') {
                characteristicClose.updateValue(true);
                characteristicOpen.updateValue(false);
            } else if(changes[1] === 'close') {
                characteristicClose.updateValue(false);
                characteristicOpen.updateValue(true);
                this.setState(1, 'stop');
            } else if(changes[1] === 'stop') {
                characteristicClose.updateValue(false);
                characteristicOpen.updateValue(false);
            }
        });

        
    }
}

module.exports = CustomBlindsAccessory;