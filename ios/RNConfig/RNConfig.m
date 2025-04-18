#import "RNConfig.h"
#import <React/RCTLog.h>

// Dictionary to store environment variables
static NSMutableDictionary *envVars;

@implementation RNConfig

// Export this module to React Native
RCT_EXPORT_MODULE();

+ (void)initialize {
  envVars = [NSMutableDictionary dictionary];
}

// Method to set environment variables from JS
RCT_EXPORT_METHOD(setEnvVars:(NSDictionary *)vars) {
  [envVars addEntriesFromDictionary:vars];
  RCTLogInfo(@"Environment variables set: %@", vars);
  
  // Post notification that environment variables have been updated
  dispatch_async(dispatch_get_main_queue(), ^{
    [[NSNotificationCenter defaultCenter] postNotificationName:@"RNConfigEnvironmentUpdated" 
                                                      object:nil 
                                                    userInfo:vars];
  });
}

// Method to get a specific environment variable
RCT_EXPORT_METHOD(getEnvVar:(NSString *)name
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  id value = envVars[name];
  if (value) {
    resolve(value);
  } else {
    NSError *error = [NSError errorWithDomain:@"com.rn_apple_login.config" code:404 userInfo:nil];
    reject(@"not_found", [NSString stringWithFormat:@"Environment variable '%@' not found", name], error);
  }
}

// Export available environment variables to JS
- (NSDictionary *)constantsToExport {
  return @{
    @"envVars": envVars ?: @{}
  };
}

// Return a singleton instance
+ (BOOL)requiresMainQueueSetup {
  return YES;
}

// This is the class method that will be called from Swift
+ (NSString *)getValueForKey:(NSString *)key {
  NSString *value = envVars[key];
  return value ?: @"";
}

// For compatibility with Swift calling conventions
+ (NSString *)getValue:(NSString *)forKey {
  return [self getValueForKey:forKey];
}

@end