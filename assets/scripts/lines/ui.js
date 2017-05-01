'use strict'
import {resetForm} from '../helpers'
import linesListTemplate from '../templates/lines-list.handlebars'
import {getVoteSummary} from './helpers'
import store from '../store'

const submitLineSuccess = ({line}) => {
  // reset the form so another line can be added
  resetForm($('#submit-line-container')).slideUp()
}

const submitLineFailure = (data) => {
  Materialize.toast('There was an issue adding your message', 3000)
}

const listLinesSuccess = ({lines}) => {
  renderNewestList(lines)
  renderMostPopularList(lines)
}

const listLinesFailure = (data) => {
  Materialize.toast('Something went wrong', 3000)
}

const deleteLineSuccess = (callback) => {
  callback()
}

const deleteLineFailure = (data) => {
  Materialize.toast('There was an issue deleting your message', 3000)
}

const updateLineSuccess = ({line}) => {
  const lineParent = $(`div[data-id=${line.id}]`)
  const lineDisplay = lineParent.find('.display-line-container')
  const lineContainer = lineParent.find('.line-text-container')
  lineContainer.find('.line-text > p').text(line.text)

  lineDisplay.fadeIn('slow')
  $('.edit-container').remove()
}

const updateLineFailure = (data) => {
  Materialize.toast('There was an issue updating your message', 3000)
}

const addVoteFailure = (data) => {
  Materialize.toast('There was an issue adding your vote', 3000)
}
const renderList = (anchor, lines) => {
  // add a summary to each line
  lines.forEach((line) => {
    line.voteSummary = getVoteSummary(line.votes)
    // if user is logged in, highlight the button that they clicked to vote on
    // each line.  i.e. if they upvoted it, highlight the up button
    if (store.user) {
      const {
        value = 0
      } = line.votes.find((vote) => vote.user_id === store.user.id) || {}

      const highlightClass = 'blue-text text-darken-3'
      const notHighlightedClass = '' // 'blue-text text-darken-3'

      line.userUpVotedClass = value === 1 ? highlightClass : notHighlightedClass
      line.userDownVotedClass = value === -1 ? highlightClass : notHighlightedClass
    }
  })
  // build the template using handlebars and data passed in
  const html = linesListTemplate({lines: lines})

  // empty the list and then append the template
  anchor.empty().append(html)
}
const renderMostPopularList = (linesList) => {
  // get the list html element
  const list = $('#lines-list-most-popular')

  // order the lines by total points
  linesList = linesList.sort(sortMostPopular)

  renderList(list, linesList)
}
const renderNewestList = (linesList) => {
  // get the list html element
  const list = $('#lines-list-newest')
  // order the lines by id, oldest to newest
  linesList.sort((line1, line2) => line2.id - line1.id)
  console.log(linesList)
  renderList(list, linesList)
}
const totalPoints = (line) => {
  const {up, down} = getVoteSummary(line.votes)
  return up - down
}

const sortMostPopular = (line1, line2) => {
  const sum = totalPoints(line2) - totalPoints(line1)
  if (sum === 0) {
    return line2.votes.length - line1.votes.length
  }
  return sum
}

module.exports = {
  submitLineSuccess,
  submitLineFailure,
  listLinesSuccess,
  listLinesFailure,
  deleteLineSuccess,
  deleteLineFailure,
  updateLineSuccess,
  updateLineFailure,
  addVoteFailure
}
