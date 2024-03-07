export class Config {
  private static _portMain: MessagePort;
  private static _portImport: MessagePort;

  static get portMain(): MessagePort {
    if (!Config._portMain) {
      throw new Error('_portMain still undefined.');
    }

    return Config._portMain;
  }

  static set portMain(port: MessagePort) {
    Config._portMain = port;
  }

  static get portImport(): MessagePort {
    if (!Config._portImport) {
      throw new Error('_portImport still undefined.');
    }

    return Config._portImport;
  }

  static set portImport(port: MessagePort) {
    Config._portImport = port;
  }
}
