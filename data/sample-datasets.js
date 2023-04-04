export const SampleDatasets = [
  {
    name: 'Dataset A',
    providers: [
      {
        name: 'Provider A',
        url: 'https://www.provider-a.com',
      },
      {
        name: 'Provider B',
        url: 'https://www.provider-a.com',
      },
      {
        name: 'Provider C',
        url: 'https://www.provider-a.com',
      },
    ],
    description:
      'This is Dataset A. Lorem Ipsum is simply dummy text of the printing and typesetting industry. ',
    thumbnail: null,
    tags: ['tag1', 'tag2', 'tag3'],
    coverage: {
      temporal_coverage_start_date: '2022-01-01',
      temporal_coverage_end_date: '2022-12-31',
      geo_spatial_coverage: 'Global',
    },
    maintainers: [
      {
        name: 'Maintainer A',
        github_username: 'maintainer-a',
      },
    ],
    license: {
      name: 'MIT License',
      url: 'https://opensource.org/licenses/MIT',
    },
    links: [
      {
        title: 'Link to GitHub',
        url: 'https://www.link-a.com',
      },
      {
        title: 'Link to publication',
        url: 'https://www.link-a.com',
      },
    ],
    doi_citation: 'https://doi.org/10.1234/dataset-a',
    expected_update_frequency: 'Daily',
    demo: true,
  },
  {
    name: 'Dataset B',
    providers: [
      {
        name: 'Provider B',
        url: 'https://www.provider-b.com',
      },
    ],
    description:
      "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    thumbnail: null,
    tags: ['tag2', 'tag3'],
    coverage: null,
    maintainers: [
      {
        name: 'Maintainer A',
        github_username: 'maintainer-a',
      },
      {
        name: 'Maintainer B',
        github_username: 'maintainer-b',
      },
    ],
    license: {
      name: 'MIT License',
      url: 'https://opensource.org/licenses/MIT',
    },
    links: [
      {
        title: 'Link B',
        url: 'https://www.link-b.com',
      },
    ],
    doi_citation: null,
    expected_update_frequency: null,
    demo: false,
  },

  {
    name: 'Dataset C',
    providers: [
      {
        name: 'Provider A',
        url: 'https://www.provider-a.com',
      },
      {
        name: 'Provider B',
        url: 'https://www.provider-b.com',
      },
    ],
    description: 'This is Dataset C.',
    thumbnail: null,
    tags: ['tag1', 'tag3'],
    coverage: null,
    maintainers: [
      {
        name: 'Maintainer A',
        github_username: 'maintainer-a',
      },
    ],
    license: {
      name: 'Apache License 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0',
    },
    links: [
      {
        title: 'Link A',
        url: 'https://www.link-a.com',
      },
      {
        title: 'Link B',
        url: 'https://www.link-b.com',
      },
    ],
    doi_citation: 'https://doi.org/10.1234/dataset-c',
    expected_update_frequency: 'Monthly',
    demo: true,
  },
  {
    name: 'Dataset D',
    providers: [
      {
        name: 'Provider B',
        url: 'https://www.provider-b.com',
      },
    ],
    description: 'This is Dataset D.',
    thumbnail: null,
    tags: ['tag2', 'tag3'],
    coverage: {
      temporal_coverage_start_date: '2023-01-01',
      temporal_coverage_end_date: '2023-12-31',
      geo_spatial_coverage: 'USA',
    },
    maintainers: [
      {
        name: 'Maintainer B',
        github_username: 'maintainer-b',
      },
    ],
    license: null,
    links: [
      {
        title: 'Link B',
        url: 'https://www.link-b.com',
      },
    ],
    doi_citation: null,
    expected_update_frequency: null,
    demo: false,
  },
  {
    name: 'Dataset E',
    providers: [
      {
        name: 'Provider A',
        url: 'https://www.provider-a.com',
      },
    ],
    description: 'This is Dataset E.',
    thumbnail: null,
    tags: ['tag1', 'tag2', 'tag3'],
    coverage: null,
    maintainers: [
      {
        name: 'Maintainer A',
        github_username: 'maintainer-a',
      },
      {
        name: 'Maintainer B',
        github_username: 'maintainer-b',
      },
    ],
    license: {
      name: 'Apache License 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0',
    },
    links: [],
    doi_citation: 'https://doi.org/10.1234/dataset-e',
    expected_update_frequency: null,
    demo: false,
  },
]
