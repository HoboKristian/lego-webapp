// @flow

import React from 'react';
import Button from 'app/components/Button';
import styles from './Poll.css';
import type { PollEntity, OptionEntity } from 'app/reducers/polls';
import { Link } from 'react-router';
import { sortBy } from 'lodash';
import Icon from 'app/components/Icon';
import { Flex } from 'app/components/Layout';
import Tooltip from 'app/components/Tooltip';

type Props = {
  poll: PollEntity,
  handleVote: (pollId: number, optionId: number) => Promise<*>,
  backgroundLight?: boolean,
  truncate?: number,
  details?: boolean
};

type State = {
  truncateOptions: boolean,
  optionsToShow: Array<OptionEntity>,
  expanded: boolean
};

type OptionEntityRatio = OptionEntity & {
  ratio: number
};

class Poll extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { options } = props.poll;
    if (props.truncate && options.length > props.truncate) {
      this.state = {
        truncateOptions: true,
        optionsToShow: options.slice(0, props.truncate),
        expanded: false
      };
    } else {
      this.state = {
        truncateOptions: false,
        optionsToShow: options,
        expanded: true
      };
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.poll.options !== this.props.poll.options) {
      this.props.truncate && !this.state.expanded
        ? this.setState({
            optionsToShow: this.props.poll.options.slice(0, this.props.truncate)
          })
        : this.setState({ optionsToShow: this.props.poll.options });
    }
  }

  toggleTruncate = () => {
    const { truncate, poll } = this.props;
    const { expanded } = this.state;
    const { options } = poll;
    expanded
      ? this.setState({
          optionsToShow: options.slice(0, truncate),
          expanded: false
        })
      : this.setState({ optionsToShow: options, expanded: true });
  };

  optionsWithPerfectRatios = (
    options: Array<OptionEntity>,
    optionsToShow: Array<OptionEntity>
  ) => {
    const totalVotes = options.reduce((a, option) => a + option.votes, 0);
    const ratios = optionsToShow.map(option => {
      return { ...option, ratio: (option.votes / totalVotes) * 100 };
    });
    return this.perfectRatios(ratios);
  };

  // As described in: https://stackoverflow.com/questions/13483430/how-to-make-rounded-percentages-add-up-to-100
  perfectRatios = (options: Array<OptionEntityRatio>) => {
    const off =
      100 - options.reduce((a, option) => a + Math.floor(option.ratio), 0);
    return sortBy(options, o => Math.floor(o.ratio) - o.ratio)
      .map((option, index) => {
        return {
          ...option,
          ratio: Math.floor(option.ratio) + (index < off ? 1 : 0)
        };
      })
      .sort((a, b) => b.ratio - a.ratio);
  };

  render() {
    const { poll, handleVote, backgroundLight, details } = this.props;
    const { truncateOptions, optionsToShow, expanded } = this.state;
    const { id, title, description, options, hasAnswered, totalVotes } = poll;

    return (
      <div
        className={`${styles.poll} ${backgroundLight ? styles.pollLight : ''}`}
      >
        <Flex>
          <Link to={`/polls/${id}`} style={{ flex: 1 }}>
            <Icon name="stats" />
            <span className={styles.pollHeader}>{title}</span>
          </Link>
          <Tooltip content="Avstemningen er anonym." renderDirection="left">
            <Icon
              name="information-circle-outline"
              size={20}
              style={{ cursor: 'pointer' }}
            />
          </Tooltip>
        </Flex>
        {details && (
          <div>
            <p>{description}</p>
          </div>
        )}
        {hasAnswered && (
          <Flex column className={styles.optionWrapper}>
            <table className={styles.pollTable}>
              <tbody>
                {this.optionsWithPerfectRatios(options, optionsToShow).map(
                  ({ id, name, votes, ratio }) => {
                    return (
                      <tr key={id}>
                        <td className={styles.textColumn}>{name}</td>
                        <td className={styles.graphColumn}>
                          {votes === 0 ? (
                            <span className={styles.noVotes}>
                              Ingen stemmer
                            </span>
                          ) : (
                            <div className={styles.fullGraph}>
                              <div
                                style={{
                                  width: `${ratio}%`
                                }}
                              >
                                <div className={styles.pollGraph}>
                                  {ratio >= 18 && <span>{`${ratio}%`}</span>}
                                </div>
                              </div>
                              {ratio < 18 && (
                                <span style={{ marginLeft: '2px' }}>
                                  {`${ratio}%`}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </Flex>
        )}
        {!hasAnswered && (
          <Flex column className={styles.optionWrapper}>
            {options &&
              optionsToShow.map(option => (
                <Flex style={{ justifyContent: 'center' }} key={option.id}>
                  <Button
                    className={styles.voteButton}
                    onClick={() => handleVote(poll.id, option.id)}
                  >
                    {option.name}
                  </Button>
                </Flex>
              ))}
          </Flex>
        )}
        <div style={{ height: '29px' }}>
          <div className={styles.moreOptionsLink}>
            <span>{`Stemmer: ${totalVotes}`}</span>
            {truncateOptions && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Icon
                  onClick={this.toggleTruncate}
                  className={styles.arrow}
                  size={20}
                  name={expanded ? 'arrow-up' : 'arrow-down'}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Poll;
