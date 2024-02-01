import { Device } from "../device/device";

export class DeviceFactory {
    private static registry: Map<string, () => Device> = new Map();

    // Method to register shapes with the factory
    public static registerDevice(deviceType: string, constructor: () => Device): void {
        DeviceFactory.registry.set(deviceType, constructor);
    }

    // Method to create shapes without a switch statement
    public static getDevice(deviceType: string): Device {
        const DeviceConstructor = DeviceFactory.registry.get(deviceType);

        if (!DeviceConstructor) {
            throw new Error(`Device type ${deviceType} not registered.`);
        }
        return DeviceConstructor();
    }
}
