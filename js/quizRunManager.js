// Type: Module

export default class QuizRunManager {
	newRun(quizData) {
		this.quizData = quizData ;
		this.currentQuestionIndex = -1 ; // (this denotes the title as the first question has index 0)
		this.quizRunAnswerSelections = [] ;
		this.numAnswered = 0 ;
	}

	setAnswer(answerIndex) {
		if (this.quizRunAnswerSelections[this.currentQuestionIndex] === undefined) this.numAnswered++ ;
		this.quizRunAnswerSelections[this.currentQuestionIndex] = answerIndex ;
		return this.numAnswered ;
	}

	getNumAnswered() {
		return this.numAnswered ;
	}

	moveQuestionIndexBy(i) {
		this.currentQuestionIndex += i ;
		return [
			this.currentQuestionIndex, 
			this.quizData.questions[this.currentQuestionIndex], // (-1 index is okay here! - and we just leave it as undefined for out of bounds)
			this.quizRunAnswerSelections[this.currentQuestionIndex] // (same here)
		]  ;
	}

	calcResults() {
		const allScores = {} ;
		for (const [questionIndex, answerIndex] of this.quizRunAnswerSelections.entries()) {
			if (answerIndex !== undefined) {
				const weights = this.quizData.questions[questionIndex].answers[answerIndex].weights ;
				for (const [resultGroupId, weightValue] of Object.entries(weights)) {
					allScores[resultGroupId] = (allScores[resultGroupId] || 0) + weightValue ;
				}
			}
		}

		// Get max score (we use reduce instead of spread operator just to be safe regarding argument limits)
		const maxScore = Object.values(allScores).reduce((a, b) => Math.max(a, b), -Infinity);
		// Get the top result groups
		const topScores = Object.fromEntries(Object.entries(allScores).filter((entry) => entry[1] === maxScore)) ;

		return {allScores, topScores} ;
	}
}