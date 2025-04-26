import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Spinner from 'react-bootstrap/Spinner';
  
import { Board, 
  GAME_DIFFICULTY, 
  GAME_MODE, 
  GamePlayer, 
  PLAYER_TYPE, 
  User, 
  pretifyGameMode,
  pretifyGameDifficulty, 
  GAME_TIMER,
  gameTimerStats} from '@src/types';
import { useUser } from '@src/providers/User';
import { useBoard } from '@src/providers/Game';
import AboutPage from '@src/components/About';

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  username_p2: z.string().min(1, "Username is required"),
  mode: z.nativeEnum(GAME_MODE).default(GAME_MODE.LOCAL),
  difficulty: z.nativeEnum(GAME_DIFFICULTY).default(GAME_DIFFICULTY.EASY),
  timer: z.nativeEnum(GAME_TIMER).default(GAME_TIMER.BULLET),
})

export default function HomePage() {

  const navigate = useNavigate();
  const { setUser } = useUser();
  const { setBoard } = useBoard();  
  const {
    register,
    watch,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema)
  })
  
  const mode = watch('mode', GAME_MODE.LOCAL);
  
  const handleLogin = () => {
    const user = new User({
      name: getValues('username')
    })
    const enemy = new User({
      name: getValues('mode') === GAME_MODE.LOCAL ? getValues('username_p2') : "Enemy"
    })
    setUser(user)
    const timer = getValues('timer') as GAME_TIMER;
    const board = new Board({
      timerConfig: timer,
      difficulty: getValues('difficulty') as GAME_DIFFICULTY,
      mode: getValues('mode') as GAME_MODE,
      p1: new GamePlayer({
        type: PLAYER_TYPE.PLAYER,
        username: user.name,
        id: user.id,
        time: gameTimerStats[timer].timer
      }),
      p2: new GamePlayer({
        type: PLAYER_TYPE.PLAYER,
        username: enemy.name,
        id: enemy.id,
        time: gameTimerStats[timer].timer
      }),
    });
    setBoard(board);
    navigate('/game');
  };

  return (
    <div className="container">
      <h1 className="h1 mt-5">Hive - Pocket version</h1>
      <h2 className="h2 display-6">Type your name, choose the game mode and have fun!!</h2>
      <form className='col-lg-5 col-sm-12 d-inline-grid' onSubmit={
        handleSubmit(handleLogin)}>
        <div className="mb-3" >
          <label className="form-label">Username</label>
          <input type="text" className={errors.username ? 'form-control invalid' : 'form-control'}
            placeholder="Enter username"
            {...register('username')}
          />
          <div className={errors.username ? 'invalid-feedback d-block' : 'invalid-feedback'}>
            {errors.username && errors.username.message}
          </div>
        </div>
        {
            mode === GAME_MODE.LOCAL && (
              <div className="mb-3" >
                <label className="form-label">Username (Player 2)</label>
                <input type="text" className={errors.username_p2 ? 'form-control invalid' : 'form-control'}
                  placeholder="Enter username"
                  {...register('username_p2')}
                />
                <div className={errors.username_p2 ? 'invalid-feedback d-block' : 'invalid-feedback'}>
                  {errors.username_p2 && errors.username_p2.message}
                </div>
              </div>
            )
          }
        <div className="mb-3">
          <label>Game mode:</label >
          <select className='form-control' disabled {...register('mode', {
            value: GAME_MODE.LOCAL
          })}
          >
            {Object.values(GAME_MODE).map((mode) => <option key={mode} value={mode}>{pretifyGameMode(mode)}</option>)}
          </select>
        </div>
        <div className="mb-3" >
          <label>Game Timer:</label >
          <select className='form-control' {...register('timer', {
            value: GAME_TIMER.BULLET
          })}
          >
            {Object.values(GAME_TIMER).map((time) => <option key={time} value={time}>{gameTimerStats[time].pretify}</option>)}
          </select>
        </div>
          {
            mode === GAME_MODE.CPU && (
              <div className="mb-3" >
                <label>Game difficulty:</label >
                <select className='form-control' {...register('difficulty', {
                  value: GAME_DIFFICULTY.EASY
                })}
                >
                  {Object.values(GAME_DIFFICULTY).map((mode) => <option key={mode} value={mode}>{pretifyGameDifficulty(mode)}</option>)}
                </select>
              </div>
            )
          }
        {
          isSubmitting
            ? <Spinner></Spinner>
            : <button className="btn btn-primary"  type="submit">
              Submit
            </button>
        }
      </form>
      <div className='col-md-2 d-inline-grid' />
      <div className='col-lg-5 col-sm-12 d-inline-grid'>
        <AboutPage />
      </div>
    </div>
  )
}
