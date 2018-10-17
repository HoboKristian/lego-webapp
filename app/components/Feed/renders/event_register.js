// @flow
import React, { type Element } from 'react';
import Icon from 'app/components/Icon';
import { lookupContext, contextRender } from '../context';
import { formatHeader } from './utils';
import type { AggregatedActivity, Activity, TagInfo } from '../types';
import DisplayContent from 'app/components/DisplayContent';

/**
 * Grouped by target and date, standard...
 */
export function activityHeader(
  aggregatedActivity: AggregatedActivity,
  htmlTag: TagInfo => Element<*>
) {
  const latestActivity = aggregatedActivity.lastActivity;
  const actors = aggregatedActivity.actorIds.map(actorId =>
    lookupContext(aggregatedActivity, 'users.user-' + actorId)
  );
  const target = lookupContext(aggregatedActivity, latestActivity.target);

  if (!(actors.length !== 0 && target)) {
    return null;
  }
  const actorsRender = actors.map(actor =>
    htmlTag(contextRender[actor.contentType](actor))
  );

  return (
    <b>
      {formatHeader(actorsRender)} meldte seg på arrangementet{' '}
      {htmlTag(contextRender[target.contentType](target))}
    </b>
  );
}

export function activityContent(activity: Activity) {
  return <DisplayContent content={''} />;
}

export function icon() {
  return <Icon name="text" />;
}

export function getURL(aggregatedActivity: AggregatedActivity) {
  const latestActivity = aggregatedActivity.lastActivity;
  const event = lookupContext(aggregatedActivity, latestActivity.target);
  if (!event) {
    return '/events';
  }
  return `/events/${event.id}`;
}
