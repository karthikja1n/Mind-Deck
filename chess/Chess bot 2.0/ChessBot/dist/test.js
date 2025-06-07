import { Chess } from 'chess.js';
import { getBestMove } from './chess-bot.js';
import { getEvaluationBar, getEvaluationChange } from './evaluation-bar.js';
import { checkBlunder, analyzeGameForBlunders } from './blunder-detection.js';
import { recognizeOpening, startFromOpening, getAllOpenings } from './openings.js';
// Test the chess bot with different difficulty levels
function testChessBot() {
    console.log('🤖 Testing Chess Bot with New Features\n');
    // Test different positions
    const testPositions = [
        {
            name: 'Starting Position',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        },
        {
            name: 'Scholar\'s Mate Setup',
            fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3'
        },
        {
            name: 'Middle Game',
            fen: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 4 4'
        }
    ];
    for (const position of testPositions) {
        console.log(`\n📋 Testing: ${position.name}`);
        console.log(`FEN: ${position.fen}\n`);
        const game = new Chess(position.fen);
        // Test evaluation bar
        const evaluation = getEvaluationBar(game);
        console.log(`📊 Evaluation: ${evaluation.pawnsAdvantage > 0 ? '+' : ''}${evaluation.pawnsAdvantage} (${evaluation.advantage})`);
        ['easy', 'medium', 'hard'].forEach(difficulty => {
            try {
                const startTime = Date.now();
                const move = getBestMove(game, difficulty);
                const endTime = Date.now();
                // Test blunder detection
                const blunderResult = checkBlunder(game, move);
                const blunderText = blunderResult.isBlunder ? ` [${blunderResult.severity.toUpperCase()} BLUNDER]` : '';
                console.log(`${difficulty.toUpperCase().padEnd(6)}: ${move.padEnd(6)} (${endTime - startTime}ms)${blunderText}`);
            }
            catch (error) {
                console.log(`${difficulty.toUpperCase().padEnd(6)}: ERROR - ${error}`);
            }
        });
    }
    // Test opening recognition
    console.log('\n🎯 Testing Opening Recognition:\n');
    const testGames = [
        {
            name: 'Italian Game',
            moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']
        },
        {
            name: 'Sicilian Defense',
            moves: ['e4', 'c5']
        },
        {
            name: 'Queen\'s Gambit',
            moves: ['d4', 'd5', 'c4']
        }
    ];
    for (const testGame of testGames) {
        const recognized = recognizeOpening(testGame.moves);
        console.log(`${testGame.name}: ${recognized ? `✅ ${recognized.name} (${recognized.eco})` : '❌ Not recognized'}`);
    }
    // Test starting from opening
    console.log('\n🏁 Testing Starting from Opening:\n');
    const italianGame = startFromOpening('Italian Game');
    if (italianGame) {
        const evaluation = getEvaluationBar(italianGame);
        console.log(`Italian Game position: ${evaluation.pawnsAdvantage > 0 ? '+' : ''}${evaluation.pawnsAdvantage}`);
    }
    // Test a full game with analysis
    console.log('\n🎯 Playing a short game with full analysis:\n');
    const game = new Chess();
    let moveCount = 0;
    const maxMoves = 10;
    const gameHistory = [];
    while (!game.isGameOver() && moveCount < maxMoves) {
        const difficulty = game.turn() === 'w' ? 'hard' : 'medium';
        const move = getBestMove(game, difficulty);
        // Check for blunders
        const blunderResult = checkBlunder(game, move);
        // Get evaluation before move
        const evalBefore = getEvaluationBar(game);
        game.move(move);
        gameHistory.push(move);
        moveCount++;
        // Get evaluation after move
        const evalAfter = getEvaluationBar(game);
        const evalChange = getEvaluationChange(new Chess(game.fen().replace(game.turn() === 'w' ? 'b' : 'w', game.turn() === 'w' ? 'w' : 'b')), game);
        const blunderText = blunderResult.isBlunder ? ` [${blunderResult.severity}]` : '';
        const evalText = `(${evalAfter.pawnsAdvantage > 0 ? '+' : ''}${evalAfter.pawnsAdvantage})`;
        console.log(`${moveCount}. ${game.turn() === 'b' ? move : '   ' + move} ${evalText}${blunderText}`);
        // Check opening recognition
        if (moveCount <= 5) {
            const opening = recognizeOpening(gameHistory);
            if (opening) {
                console.log(`   📖 Opening: ${opening.name}`);
            }
        }
    }
    // Analyze the game for blunders
    const blunders = analyzeGameForBlunders(gameHistory);
    const blunderCount = blunders.filter(b => b.isBlunder).length;
    console.log(`\n📈 Game Analysis: ${blunderCount} blunders detected`);
    console.log(`\nGame ended after ${moveCount} moves`);
    if (game.isGameOver()) {
        if (game.isCheckmate()) {
            console.log(`Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`);
        }
        else if (game.isDraw()) {
            console.log('Draw!');
        }
    }
    // Show available openings
    console.log('\n📚 Available Openings:');
    const openings = getAllOpenings();
    openings.slice(0, 5).forEach(opening => {
        console.log(`  ${opening.name} (${opening.eco}): ${opening.description}`);
    });
    console.log(`  ... and ${openings.length - 5} more openings`);
}
// Run the test
testChessBot();
//# sourceMappingURL=test.js.map