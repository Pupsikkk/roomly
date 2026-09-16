import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  CONFIG_NAMESPACES,
  type ConfigNamespace,
} from './configuration';
import { resolveEnvFilePaths } from './env';
import { RoomlyConfigService } from './roomly-config.service';

export interface RoomlyConfigModuleOptions {
  /**
   * Which env namespaces this app needs.
   * Example: `load: ['services', 'auth', 'postgres']`
   */
  load: ConfigNamespace[];
  /** Defaults to true */
  isGlobal?: boolean;
}

@Module({})
export class RoomlyConfigModule {
  static forRoot(options: RoomlyConfigModuleOptions): DynamicModule {
    if (!options.load?.length) {
      throw new Error(
        'RoomlyConfigModule.forRoot({ load }) requires at least one namespace',
      );
    }

    const unknown = options.load.filter((name) => !(name in CONFIG_NAMESPACES));
    if (unknown.length) {
      throw new Error(
        `Unknown config namespace(s): ${unknown.join(', ')}. ` +
          `Known: ${Object.keys(CONFIG_NAMESPACES).join(', ')}`,
      );
    }

    const load = options.load.map((name) => CONFIG_NAMESPACES[name]);

    return {
      module: RoomlyConfigModule,
      global: options.isGlobal ?? true,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          expandVariables: true,
          envFilePath: resolveEnvFilePaths(),
          load,
        }),
      ],
      providers: [RoomlyConfigService],
      exports: [ConfigModule, RoomlyConfigService],
    };
  }
}
