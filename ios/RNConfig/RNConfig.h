#import <React/RCTBridgeModule.h>

@interface RNConfig : NSObject <RCTBridgeModule>

// Explicitly declare the class method with proper Objective-C syntax for Swift compatibility
+ (NSString *)getValueForKey:(NSString *)key;

@end