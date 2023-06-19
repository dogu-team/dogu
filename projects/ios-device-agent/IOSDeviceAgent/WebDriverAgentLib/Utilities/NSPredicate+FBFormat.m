/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "NSPredicate+FBFormat.h"

#import "NSExpression+FBFormat.h"
#import "FBXCElementSnapshotWrapper+Helpers.h"

@implementation NSPredicate (FBFormat)

+ (instancetype)fb_predicateWithPredicate:(NSPredicate *)original
                       comparisonModifier:(NSPredicate *(^)(NSComparisonPredicate *))comparisonModifier
{
  if ([original isKindOfClass:NSCompoundPredicate.class]) {
    NSCompoundPredicate *compPred = (NSCompoundPredicate *)original;
    NSMutableArray *predicates = [NSMutableArray array];
    for (NSPredicate *predicate in [compPred subpredicates]) {
      NSPredicate *newPredicate = [self.class fb_predicateWithPredicate:predicate
                                                     comparisonModifier:comparisonModifier];
      if (nil != newPredicate) {
        [predicates addObject:newPredicate];
      }
    }
    return [[NSCompoundPredicate alloc] initWithType:compPred.compoundPredicateType
                                       subpredicates:predicates];
  }
  if ([original isKindOfClass:NSComparisonPredicate.class]) {
    return comparisonModifier((NSComparisonPredicate *)original);
  }
  return original;
}

+ (instancetype)fb_formatSearchPredicate:(NSPredicate *)input
{
  return [self.class fb_predicateWithPredicate:input
                            comparisonModifier:^NSPredicate *(NSComparisonPredicate *cp) {
    NSExpression *left = [NSExpression fb_wdExpressionWithExpression:[cp leftExpression]];
    NSExpression *right = [NSExpression fb_wdExpressionWithExpression:[cp rightExpression]];
    return [NSComparisonPredicate predicateWithLeftExpression:left
                                              rightExpression:right
                                                     modifier:cp.comparisonPredicateModifier
                                                         type:cp.predicateOperatorType
                                                      options:cp.options];
  }];
}

+ (instancetype)fb_snapshotBlockPredicateWithPredicate:(NSPredicate *)input
{
  if ([NSStringFromClass(input.class) isEqualToString:@"NSBlockPredicate"]) {
    return input;
  }

  NSPredicate *wdPredicate = [self.class fb_formatSearchPredicate:input];
  return [NSPredicate predicateWithBlock:^BOOL(id evaluatedObject,
                                               NSDictionary<NSString *,id> * _Nullable bindings) {
    FBXCElementSnapshotWrapper *wrappedSnapshot = [FBXCElementSnapshotWrapper ensureWrapped:evaluatedObject];
    return [wdPredicate evaluateWithObject:wrappedSnapshot];
  }];
}


@end
