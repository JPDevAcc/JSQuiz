// Type: Module

export default class QuizUIManager {
	constructor(selectors, questionIndexChangeCallback, questionAnswerSelectCallback) {
		// Get elements / templates
		const keysToRetrieve = [
			'quizTitle', 'quizSelectorContainer', 'quizIntroText', 
			'quizStartButton', 'prevQuestionButton', 'nextQuestionButton', 'resultsToLastQButton',
			'progressStatus', 'quizQuestionContainer', 'quizQuestion', 'quizAnswersContainer', 'quizAnswerTemplate',
			'quizResultsContainer', 'tieNotification', 'results', 'resultInfo', 'resultsLineTemplate'
		] ;
		this.els = getElementsBySelector(selectors, keysToRetrieve) ;

		// Add event listeners for all the buttons that go backwards / forwards through the title -> questions -> results
		this.els.quizStartButton.addEventListener('click', () => questionIndexChangeCallback(+1)) ;
		this.els.prevQuestionButton.addEventListener('click', () => questionIndexChangeCallback(-1)) ;
		this.els.nextQuestionButton.addEventListener('click', () => questionIndexChangeCallback(+1)) ;
		this.els.resultsToLastQButton.addEventListener('click', () => questionIndexChangeCallback(-1)) ;
		
		// Note the callback for when an answer is selected and also the selectors for accessing elements in newly created template clones
		this.questionAnswerSelectCallback = questionAnswerSelectCallback ;
		this.selectors = selectors ;
	}

	initForQuiz(quizTitle, quizData) {
		this.els.quizTitle.innerText = quizTitle ;
		this.els.quizIntroText.innerText = quizData.introText ;
		this.quizData = quizData ;
		this.numQuestions =  this.quizData.questions.length ;
		this.numAnswersRequired = (this.quizData.settings && this.quizData.settings.minAnswers) ? Number(this.quizData.settings.minAnswers) : this.numQuestions ;
	}

	updateUI(questionIndex, questionData = null, selectedAnswerIndex = null, numAnswered = null, results = null) {
		this.questionIndex = questionIndex ;

		if (questionIndex === -1) this.showTitleElements() ;
		else if (questionData) {
			this.setProgressDescription(numAnswered) ;
			this.showQuestion(questionData, selectedAnswerIndex) ;
			this.setNextQuestionEnabledState(numAnswered) ;
		}
		else this.showResults(results.allScores, results.topScores, numAnswered) ;
	}

	setNextQuestionEnabledState(numAnswered) {
		this.els.nextQuestionButton.disabled = (this.questionIndex === this.numQuestions - 1 && numAnswered < this.numAnswersRequired) ;
	}

	showTitleElements() {
		this.setVisibilities(true, false, false) ;
	}

	setProgressDescription(numAnswered) {
		this.els.progressStatus.innerHTML = 'Question ' + (this.questionIndex + 1) + " / " + this.numQuestions + "<br>" +
			"(" + numAnswered + " answered out of a minimum of " + this.numAnswersRequired + ")" ;
	}

	showQuestion(questionData, selectedAnswerIndex) {
		this.setVisibilities(false, true, false) ;

		// Question
		this.els.quizQuestion.innerText = questionData.question ;

		// Answer choices
		this.els.quizAnswersContainer.innerHTML = '' ;
		for (const [i, answer] of questionData.answers.entries()) {
			// Clone the template to create a new answer-choice element for the answers list
			const quizAnswerEl = this.els.quizAnswerTemplate.content.firstElementChild.cloneNode(true);

			// Set all the content for this answer-choice element
			quizAnswerEl.querySelector(this.selectors.quizAnswerImg).src = answer.imageSrc ;
			quizAnswerEl.querySelector(this.selectors.quizAnswerText).innerText = answer.text ;
	
			// Add it to the answer-choices container element
			this.els.quizAnswersContainer.appendChild(quizAnswerEl) ;

			// Add click event-listener for it
			quizAnswerEl.addEventListener('click', () => this.handleAnswerSelection(i)) ;
		}

		// Set as selected answer
		if (selectedAnswerIndex !== null) {
			this.els.quizAnswersContainer.childNodes[selectedAnswerIndex].classList.add('my-card-selected') ;
		}
	}

	changeSelectedAnswer(answerIndex) {
		for (const [i, el] of this.els.quizAnswersContainer.childNodes.entries()) {
			el.classList.toggle('my-card-selected', (i === answerIndex)) ;
		}
	}

	handleAnswerSelection(answerIndex) {
		this.changeSelectedAnswer(answerIndex) ;
		const numAnswered = this.questionAnswerSelectCallback(answerIndex) ;
		this.setNextQuestionEnabledState(numAnswered) ;
		this.setProgressDescription(numAnswered) ;
	}

	showResults(allScores, topScores, numAnswered) {
		this.setVisibilities(false, false, true) ;
		this.els.results.innerHTML = "" ;
		this.els.resultInfo.innerHTML = "" ;
		for (const [resultGroupIndex, [resultGroupId, score]] of Object.entries(topScores).entries()) {
			const groupData = this.quizData.resultGroups[resultGroupId] ;

			// Clone the template to create a new result-line element and set its content
			const resultLineEl = this.els.resultsLineTemplate.content.firstElementChild.cloneNode(true) ;
			resultLineEl.querySelector(this.selectors.resultsLineText).innerText = groupData.title + ' : ' + Math.round(score * 100 / numAnswered) + '%';
			this.els.results.appendChild(resultLineEl) ;

			resultLineEl.addEventListener('click', () => this.selectResultGroup(resultGroupIndex, groupData)) ;
		}

		const isTie = Object.keys(topScores).length > 1 ;
		if (!isTie) this.selectResultGroup(0, this.quizData.resultGroups[Object.keys(topScores)[0]]) ;
		this.els.tieNotification.classList.toggle('d-none', !isTie) ;
	}

	selectResultGroup(resultGroupIndex, groupData) {
		for (const [i, el] of this.els.results.childNodes.entries()) {
			el.classList.toggle('my-card-selected', (i === resultGroupIndex)) ;
		}
		this.els.resultInfo.innerHTML = markupToHtml(groupData.description) ;
	}

	setVisibilities(quizTitleVisible, questionVisible, resultsVisible) {
		this.els.quizSelectorContainer.classList.toggle('d-none', !quizTitleVisible) ;
		this.els.quizQuestionContainer.classList.toggle('d-none', !questionVisible) ;
		this.els.quizResultsContainer.classList.toggle('d-none', !resultsVisible) ;
	}
}