import React, { useState } from 'react'
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap'
import { useApolloClient, useMutation, useReactiveVar } from '@apollo/client'

import { GET_SPEAKERS } from '../graphql/queries'
import { ADD_SPEAKERS, TOGGLE_SPEAKER_FAVORITE } from '../graphql/mutations'
import { currentThemeVar, checkBoxListVar, paginationDataVar } from '../graphql/apolloClient'
import PagingOffsetLimitControl from './PagingOffsetLimitControl'

const Toolbar = ({ totalItemCount }) => {
  const apolloClient = useApolloClient()
  const paginationData = useReactiveVar(paginationDataVar)
  const [addSpeaker] = useMutation(ADD_SPEAKERS)
  const [toggleSpeakerFavorite] = useMutation(TOGGLE_SPEAKER_FAVORITE)

  const [modal, setModal] = useState(false)

  const toggle = () => {
    setModal(!modal)
  }

  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [favorite, setFavorite] = useState(false)

  const sortByIdDescending = () => {
    const { speakers } = apolloClient.cache.readQuery({
      query: GET_SPEAKERS,
      variables: {
        limit: paginationData.limit,
        offset: paginationData.offset,
      },
    })
    apolloClient.cache.writeQuery({
      query: GET_SPEAKERS,
      variables: {
        limit: paginationData.limit,
        offset: paginationData.offset,
      },
      data: {
        speakers: {
          __typename: 'SpeakerResults',
          datalist: [...speakers.datalist].sort((a, b) => b.id - a.id),
          pageInfo: {
            __typename: 'PageInfo',
            totalItemCount: totalItemCount,
          },
        },
      },
    })
  }

  const insertSpeakerEvent = (first, last, favorite) => {
    addSpeaker({
      variables: {
        first,
        last,
        favorite,
      },
      update: (cache, { data: { addSpeaker } }) => {
        const { speakers } = cache.readQuery({
          query: GET_SPEAKERS,
          variables: {
            limit: paginationData.limit,
            offset: paginationData.offset,
          },
        })
        cache.writeQuery({
          query: GET_SPEAKERS,
          variables: {
            limit: paginationData.limit,
            offset: paginationData.offset,
          },
          data: {
            speakers: {
              __typename: 'SpeakerResults',
              datalist: [addSpeaker, ...speakers.datalist],
              pageInfo: {
                __typename: 'PageInfo',
                totalItemCount: totalItemCount,
              },
            },
          },
        })
      },
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    insertSpeakerEvent(first, last, favorite)
    setFirst('')
    setLast('')
    setFavorite(false)
    setModal(!modal)
  }

  const currentTheme = useReactiveVar(currentThemeVar)
  const lastPage = Math.trunc((totalItemCount - 1) / paginationData.limit)

  return (
    <section className="toolbar">
      <div className="container">
        <ul className="toolrow">
          <li>
            <PagingOffsetLimitControl lastPage={lastPage} />
          </li>
          <li>
            <label className="dropmenu">
              <select
                className="form-control theme"
                value={currentTheme}
                onChange={({ currentTarget }) => {
                  currentThemeVar(currentTarget.value)
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </li>
          <li>
            <div>
              <Button color="info" onClick={toggle}>
                <span>Insert Speaker</span>
              </Button>
              &nbsp;
              <Button onClick={sortByIdDescending} color="info">
                <span>Sort Speakers By Id Descending</span>
              </Button>
              &nbsp;
              <Button
                color="info"
                onClick={() => {
                  const selectedSpeakerIds = checkBoxListVar()
                  if (selectedSpeakerIds) {
                    selectedSpeakerIds.forEach((speakerId) => {
                      toggleSpeakerFavorite({
                        variables: {
                          speakerId: parseInt(speakerId),
                        },
                      })
                    })
                  }
                }}
              >
                <span>Toggle All Checked</span>
              </Button>
              <Modal isOpen={modal} toggle={toggle}>
                <Form onSubmit={handleSubmit}>
                  <ModalHeader toggle={toggle}>Insert Speaker Dialog</ModalHeader>
                  <ModalBody>
                    <FormGroup>
                      <Label for="first">First Name</Label>{' '}
                      <Input name="first" onChange={(e) => setFirst(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                      <Label for="first">Last Name</Label>{' '}
                      <Input name="first" onChange={(e) => setLast(e.target.value)} />
                    </FormGroup>
                    <FormGroup check>
                      <Label check>
                        <Input
                          type="checkbox"
                          onChange={(e) => setFavorite(e.target.value === 'on')}
                        />{' '}
                        Favorite
                      </Label>
                    </FormGroup>
                  </ModalBody>
                  <ModalFooter>
                    <Button type="submit">Save</Button>
                  </ModalFooter>
                </Form>
              </Modal>
            </div>
          </li>
        </ul>
      </div>
    </section>
  )
}

export default Toolbar
