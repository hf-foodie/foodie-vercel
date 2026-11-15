'use client'
import ConfirmDialog from '@/components/krds/ConfirmDialog'
import { Breadcrumb, PageHeading, StatusMessage } from '@/components/krds/PageHeading'
import dynamic from 'next/dynamic'
import { useState } from 'react'
const Wheel = dynamic(() => import('react-custom-roulette-r19').then((m) => m.Wheel), { ssr: false })
const colors = ['#174bca', '#245b72', '#536579', '#3956a1', '#27614f', '#754475', '#795430']
const initialData = ['구내식당', '풍국면', '동동국밥', '미도방', '나진국밥', '마루카츠', '네이볼'].map((option, i) => ({
  option,
  style: { backgroundColor: colors[i], textColor: 'white' },
}))
export default function GamePage() {
  const [mustSpin, setMustSpin] = useState(false),
    [prizeNumber, setPrizeNumber] = useState(0),
    [wheelData, setWheelData] = useState(initialData),
    [results, setResults] = useState<string[]>([]),
    [newItem, setNewItem] = useState(''),
    [editingIndex, setEditingIndex] = useState<number | null>(null),
    [editingText, setEditingText] = useState(''),
    [confirm, setConfirm] = useState<'reset' | 'delete' | null>(null)
  function spin() {
    if (mustSpin || !wheelData.length) return
    setEditingIndex(null)
    setPrizeNumber(Math.floor(Math.random() * wheelData.length))
    setMustSpin(true)
  }
  function add() {
    if (mustSpin || !newItem.trim()) return
    setWheelData([
      ...wheelData,
      {
        option: newItem.trim(),
        style: { backgroundColor: colors[wheelData.length % colors.length], textColor: 'white' },
      },
    ])
    setNewItem('')
  }
  return (
    <main className="kr-container kr-main kr-game">
      <Breadcrumb current="오늘의메뉴" parent={{ label: '맛집탐방', href: '/search' }} />
      <PageHeading title="오늘의메뉴" description="고르기 어려운 오늘의 메뉴, 추첨으로 정해보세요." />
      <p className="kr-form-note">메뉴와 추첨 결과는 현재 화면에서만 유지됩니다.</p>
      <div className="kr-game-grid">
        <section className="kr-panel kr-wheel-panel" aria-label="메뉴 추첨">
          <div className="kr-wheel">
            {wheelData.length ? (
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={wheelData}
                onStopSpinning={() => {
                  setMustSpin(false)
                  setResults((prev) => [...prev, wheelData[prizeNumber]?.option || ''])
                }}
              />
            ) : (
              <p className="kr-empty">추첨할 메뉴를 추가해 주세요.</p>
            )}
          </div>
          <button className="kr-button kr-button-primary" disabled={mustSpin || !wheelData.length} onClick={spin}>
            {mustSpin ? '추첨 중…' : '추첨'}
          </button>
          <StatusMessage>
            {mustSpin
              ? '메뉴를 추첨하고 있습니다.'
              : results.length
                ? '오늘은 ' + results[results.length - 1] + ' 먹는 날!'
                : null}
          </StatusMessage>
        </section>
        <div className="space-y-6">
          <section className="kr-panel">
            <h2>메뉴 관리</h2>
            <form
              className="kr-game-add"
              onSubmit={(e) => {
                e.preventDefault()
                add()
              }}
            >
              <label className="sr-only" htmlFor="new-menu">
                새 메뉴 이름
              </label>
              <input
                id="new-menu"
                className="kr-input"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="새 메뉴 이름"
                disabled={mustSpin}
              />
              <button className="kr-button kr-button-primary" disabled={mustSpin || !newItem.trim()}>
                추가
              </button>
            </form>
            <div className="kr-actions mb-4">
              <button className="kr-button" disabled={mustSpin} onClick={() => setConfirm('reset')}>
                메뉴 초기화
              </button>
              <button
                className="kr-button"
                disabled={mustSpin || !wheelData.length}
                onClick={() => setConfirm('delete')}
              >
                전체 삭제
              </button>
            </div>
            <ul className="kr-menu-list">
              {wheelData.map((item, i) => (
                <li key={i}>
                  {editingIndex === i ? (
                    <input
                      className="kr-input"
                      aria-label="메뉴 이름 수정"
                      disabled={mustSpin}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                  ) : (
                    <span>{item.option}</span>
                  )}
                  <div className="kr-actions">
                    {editingIndex === i ? (
                      <>
                        <button
                          className="kr-button"
                          disabled={mustSpin || !editingText.trim()}
                          onClick={() => {
                            setWheelData(wheelData.map((x, n) => (n === i ? { ...x, option: editingText.trim() } : x)))
                            setEditingIndex(null)
                          }}
                        >
                          저장
                        </button>
                        <button className="kr-button" onClick={() => setEditingIndex(null)} disabled={mustSpin}>
                          취소
                        </button>
                      </>
                    ) : (
                      <button
                        className="kr-button"
                        disabled={mustSpin}
                        onClick={() => {
                          setEditingIndex(i)
                          setEditingText(item.option)
                        }}
                        aria-label={item.option + ' 수정'}
                      >
                        수정
                      </button>
                    )}
                    <button
                      className="kr-button"
                      disabled={mustSpin}
                      aria-label={item.option + ' 삭제'}
                      onClick={() => {
                        setWheelData(wheelData.filter((_, n) => i !== n))
                        setEditingIndex(null)
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="kr-panel">
            <div className="kr-section-heading">
              <h2>추첨 결과</h2>
              <button className="kr-button" disabled={!results.length} onClick={() => setResults([])}>
                결과 초기화
              </button>
            </div>
            <ol className="kr-game-results">
              {results.map((result, i) => (
                <li key={i}>
                  {i + 1}. {result}
                </li>
              ))}
            </ol>
            {!results.length && <p className="kr-muted">아직 추첨 결과가 없습니다.</p>}
          </section>
        </div>
      </div>
      <ConfirmDialog
        open={!!confirm}
        title={confirm === 'reset' ? '기본 메뉴로 되돌릴까요?' : '모든 메뉴를 삭제할까요?'}
        description={
          confirm === 'reset'
            ? '작성한 메뉴 목록을 기본 7개 메뉴로 바꿉니다.'
            : '현재 메뉴 목록을 비웁니다. 메뉴 초기화로 기본 목록을 복원할 수 있습니다.'
        }
        confirmLabel={confirm === 'reset' ? '초기화' : '삭제'}
        busy={false}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          setWheelData(confirm === 'reset' ? initialData : [])
          setEditingIndex(null)
          setConfirm(null)
        }}
      />
    </main>
  )
}
