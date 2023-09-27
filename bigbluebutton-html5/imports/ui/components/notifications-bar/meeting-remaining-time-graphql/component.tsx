import { Meteor } from 'meteor/meteor';
import React, { useEffect, useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { defineMessages, injectIntl } from 'react-intl';
import injectNotify from '/imports/ui/components/common/toast/inject-notify/component';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import BreakoutService from '/imports/ui/components/breakout-room/service';
import { Text, Time } from './styles';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { isEmpty } from 'radash';

const intlMessages = defineMessages({
  failedMessage: {
    id: 'app.failedMessage',
    description: 'Notification for connecting to server problems',
  },
  connectingMessage: {
    id: 'app.connectingMessage',
    description: 'Notification message for when client is connecting to server',
  },
  waitingMessage: {
    id: 'app.waitingMessage',
    description: 'Notification message for disconnection with reconnection counter',
  },
  breakoutTimeRemaining: {
    id: 'app.breakoutTimeRemainingMessage',
    description: 'Message that tells how much time is remaining for the breakout room',
  },
  breakoutWillClose: {
    id: 'app.breakoutWillCloseMessage',
    description: 'Message that tells time has ended and breakout will close',
  },
  calculatingBreakoutTimeRemaining: {
    id: 'app.calculatingBreakoutTimeRemaining',
    description: 'Message that tells that the remaining time is being calculated',
  },
  alertBreakoutEndsUnderMinutes: {
    id: 'app.meeting.alertBreakoutEndsUnderMinutes',
    description: 'Alert that tells that the breakout ends under x minutes',
  },
  alertMeetingEndsUnderMinutes: {
    id: 'app.meeting.alertMeetingEndsUnderMinutes',
    description: 'Alert that tells that the meeting ends under x minutes',
  },
});

interface MeetingRemainingTimeComponentProps {
  children: React.ReactNode;
}

interface MeetingRemainingTimeContainerProps {
  message: string | '';
  bold: boolean;
}

// TODO define inside last function
// let timeRemaining = 0;
// let prevTimeRemaining = 0;
// let lastAlertTime = null;

// const METEOR_SETTINGS_APP = Meteor.settings.public.app;
// const REMAINING_TIME_ALERT_THRESHOLD_ARRAY = METEOR_SETTINGS_APP.remainingTimeAlertThresholdArray;

// const timeRemainingDep = new Tracker.Dependency();
// let timeRemainingInterval = null;

const MeetingRemainingTimeComponent: React.FC<MeetingRemainingTimeComponentProps> = ({ children }) => {
  return (
    <span data-test="timeRemaining">
      {children}
    </span>
  );
};

const MeetingRemainingTimeContainer: React.FC<MeetingRemainingTimeContainerProps> = ({ message, bold }) => {
  const [timeRemaining, setTimeRemaining] = useState<number|null>(0);
  const [prevTimeRemaining, setPrevTimeRemaining] = useState<number|null>(0);
  const [timeRemainingInterval, setTimeRemainingInterval] = useState<number|null>(null);

  useEffect(() => {
    return () => {
      // clearInterval(timeRemainingInterval);
      setTimeRemainingInterval(null);
      setTimeRemaining(null);
    };
  }, []);

  if (isEmpty(message)) return null;

  if (bold) {
    const words = message.split(' ');
    const time = words.pop();
    const text = words.join(' ');

    return (
      <MeetingRemainingTimeComponent>
        <Text>{text}</Text>
        <br />
        <Time data-test="breakoutRemainingTime">{time}</Time>
      </MeetingRemainingTimeComponent>
    );
  }
  return (
    <MeetingRemainingTimeComponent>
      {`${message} não bold`}
    </MeetingRemainingTimeComponent>
  );
};

export default MeetingRemainingTimeContainer;
