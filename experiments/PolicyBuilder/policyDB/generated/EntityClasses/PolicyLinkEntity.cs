///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:06
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.ComponentModel;
using System.Collections.Generic;
using System.Collections;
#if !CF
using System.Runtime.Serialization;
#endif
using System.Data;
using System.Xml.Serialization;
using policyDB;
using policyDB.FactoryClasses;
using policyDB.DaoClasses;
using policyDB.RelationClasses;
using policyDB.HelperClasses;
using policyDB.CollectionClasses;

using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.EntityClasses
{
	
	// __LLBLGENPRO_USER_CODE_REGION_START AdditionalNamespaces
	// __LLBLGENPRO_USER_CODE_REGION_END

	/// <summary>
	/// Entity class which represents the entity 'PolicyLink'. <br/><br/>
	/// 
	/// </summary>
	[Serializable]
	public partial class PolicyLinkEntity : CommonEntityBase, ISerializable
		// __LLBLGENPRO_USER_CODE_REGION_START AdditionalInterfaces
		// __LLBLGENPRO_USER_CODE_REGION_END	
	{
		#region Class Member Declarations
		private policyDB.CollectionClasses.PolicyDocumentCollection	_policyDocument;
		private bool	_alwaysFetchPolicyDocument, _alreadyFetchedPolicyDocument;
		private policyDB.CollectionClasses.PolicyLinkCollection	_children;
		private bool	_alwaysFetchChildren, _alreadyFetchedChildren;
		private policyDB.CollectionClasses.LibraryCollection _libraryCollectionViaPolicyDocument;
		private bool	_alwaysFetchLibraryCollectionViaPolicyDocument, _alreadyFetchedLibraryCollectionViaPolicyDocument;
		private policyDB.CollectionClasses.PolicyCollection _policyCollectionViaPolicyLink;
		private bool	_alwaysFetchPolicyCollectionViaPolicyLink, _alreadyFetchedPolicyCollectionViaPolicyLink;
		private PolicyEntity _policy;
		private bool	_alwaysFetchPolicy, _alreadyFetchedPolicy, _policyReturnsNewIfNotFound;
		private PolicyLinkEntity _parent;
		private bool	_alwaysFetchParent, _alreadyFetchedParent, _parentReturnsNewIfNotFound;

		
		// __LLBLGENPRO_USER_CODE_REGION_START PrivateMembers
		// __LLBLGENPRO_USER_CODE_REGION_END
		#endregion

		#region Statics
		private static Dictionary<string, string>	_customProperties;
		private static Dictionary<string, Dictionary<string, string>>	_fieldsCustomProperties;

		/// <summary>All names of fields mapped onto a relation. Usable for in-memory filtering</summary>
		public static class MemberNames
		{
			/// <summary>Member name Policy</summary>
			public static readonly string Policy = "Policy";
			/// <summary>Member name Parent</summary>
			public static readonly string Parent = "Parent";
			/// <summary>Member name PolicyDocument</summary>
			public static readonly string PolicyDocument = "PolicyDocument";
			/// <summary>Member name Children</summary>
			public static readonly string Children = "Children";
			/// <summary>Member name LibraryCollectionViaPolicyDocument</summary>
			public static readonly string LibraryCollectionViaPolicyDocument = "LibraryCollectionViaPolicyDocument";
			/// <summary>Member name PolicyCollectionViaPolicyLink</summary>
			public static readonly string PolicyCollectionViaPolicyLink = "PolicyCollectionViaPolicyLink";

		}
		#endregion
		
		/// <summary>Static CTor for setting up custom property hashtables. Is executed before the first instance of this entity class or derived classes is constructed. </summary>
		static PolicyLinkEntity()
		{
			SetupCustomPropertyHashtables();
		}

		/// <summary>CTor</summary>
		public PolicyLinkEntity()
		{
			InitClassEmpty(null);
		}


		/// <summary>CTor</summary>
		/// <param name="id">PK value for PolicyLink which data should be fetched into this PolicyLink object</param>
		public PolicyLinkEntity(System.Int32 id)
		{
			InitClassFetch(id, null, null);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for PolicyLink which data should be fetched into this PolicyLink object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		public PolicyLinkEntity(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			InitClassFetch(id, null, prefetchPathToUse);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for PolicyLink which data should be fetched into this PolicyLink object</param>
		/// <param name="validator">The custom validator object for this PolicyLinkEntity</param>
		public PolicyLinkEntity(System.Int32 id, IValidator validator)
		{
			InitClassFetch(id, validator, null);
		}


		/// <summary>Private CTor for deserialization</summary>
		/// <param name="info"></param>
		/// <param name="context"></param>
		protected PolicyLinkEntity(SerializationInfo info, StreamingContext context) : base(info, context)
		{
			_policyDocument = (policyDB.CollectionClasses.PolicyDocumentCollection)info.GetValue("_policyDocument", typeof(policyDB.CollectionClasses.PolicyDocumentCollection));
			_alwaysFetchPolicyDocument = info.GetBoolean("_alwaysFetchPolicyDocument");
			_alreadyFetchedPolicyDocument = info.GetBoolean("_alreadyFetchedPolicyDocument");
			_children = (policyDB.CollectionClasses.PolicyLinkCollection)info.GetValue("_children", typeof(policyDB.CollectionClasses.PolicyLinkCollection));
			_alwaysFetchChildren = info.GetBoolean("_alwaysFetchChildren");
			_alreadyFetchedChildren = info.GetBoolean("_alreadyFetchedChildren");
			_libraryCollectionViaPolicyDocument = (policyDB.CollectionClasses.LibraryCollection)info.GetValue("_libraryCollectionViaPolicyDocument", typeof(policyDB.CollectionClasses.LibraryCollection));
			_alwaysFetchLibraryCollectionViaPolicyDocument = info.GetBoolean("_alwaysFetchLibraryCollectionViaPolicyDocument");
			_alreadyFetchedLibraryCollectionViaPolicyDocument = info.GetBoolean("_alreadyFetchedLibraryCollectionViaPolicyDocument");
			_policyCollectionViaPolicyLink = (policyDB.CollectionClasses.PolicyCollection)info.GetValue("_policyCollectionViaPolicyLink", typeof(policyDB.CollectionClasses.PolicyCollection));
			_alwaysFetchPolicyCollectionViaPolicyLink = info.GetBoolean("_alwaysFetchPolicyCollectionViaPolicyLink");
			_alreadyFetchedPolicyCollectionViaPolicyLink = info.GetBoolean("_alreadyFetchedPolicyCollectionViaPolicyLink");
			_policy = (PolicyEntity)info.GetValue("_policy", typeof(PolicyEntity));
			if(_policy!=null)
			{
				_policy.AfterSave+=new EventHandler(OnEntityAfterSave);
			}
			_policyReturnsNewIfNotFound = info.GetBoolean("_policyReturnsNewIfNotFound");
			_alwaysFetchPolicy = info.GetBoolean("_alwaysFetchPolicy");
			_alreadyFetchedPolicy = info.GetBoolean("_alreadyFetchedPolicy");
			_parent = (PolicyLinkEntity)info.GetValue("_parent", typeof(PolicyLinkEntity));
			if(_parent!=null)
			{
				_parent.AfterSave+=new EventHandler(OnEntityAfterSave);
			}
			_parentReturnsNewIfNotFound = info.GetBoolean("_parentReturnsNewIfNotFound");
			_alwaysFetchParent = info.GetBoolean("_alwaysFetchParent");
			_alreadyFetchedParent = info.GetBoolean("_alreadyFetchedParent");

			base.FixupDeserialization(FieldInfoProviderSingleton.GetInstance(), PersistenceInfoProviderSingleton.GetInstance());
			
			// __LLBLGENPRO_USER_CODE_REGION_START DeserializationConstructor
			// __LLBLGENPRO_USER_CODE_REGION_END
		}

		
		/// <summary>Performs the desync setup when an FK field has been changed. The entity referenced based on the FK field will be dereferenced and sync info will be removed.</summary>
		/// <param name="fieldIndex">The fieldindex.</param>
		protected override void PerformDesyncSetupFKFieldChange(int fieldIndex)
		{
			switch((PolicyLinkFieldIndex)fieldIndex)
			{
				case PolicyLinkFieldIndex.PolicyId:
					DesetupSyncPolicy(true, false);
					_alreadyFetchedPolicy = false;
					break;
				case PolicyLinkFieldIndex.ParentId:
					DesetupSyncParent(true, false);
					_alreadyFetchedParent = false;
					break;
				default:
					base.PerformDesyncSetupFKFieldChange(fieldIndex);
					break;
			}
		}
		
		/// <summary>Gets the inheritance info provider instance of the project this entity instance is located in. </summary>
		/// <returns>ready to use inheritance info provider instance.</returns>
		protected override IInheritanceInfoProvider GetInheritanceInfoProvider()
		{
			return InheritanceInfoProviderSingleton.GetInstance();
		}
		
		/// <summary> Will perform post-ReadXml actions</summary>
		protected override void PostReadXmlFixups()
		{
			_alreadyFetchedPolicyDocument = (_policyDocument.Count > 0);
			_alreadyFetchedChildren = (_children.Count > 0);
			_alreadyFetchedLibraryCollectionViaPolicyDocument = (_libraryCollectionViaPolicyDocument.Count > 0);
			_alreadyFetchedPolicyCollectionViaPolicyLink = (_policyCollectionViaPolicyLink.Count > 0);
			_alreadyFetchedPolicy = (_policy != null);
			_alreadyFetchedParent = (_parent != null);

		}
				
		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public override RelationCollection GetRelationsForFieldOfType(string fieldName)
		{
			return PolicyLinkEntity.GetRelationsForField(fieldName);
		}

		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public static RelationCollection GetRelationsForField(string fieldName)
		{
			RelationCollection toReturn = new RelationCollection();
			switch(fieldName)
			{
				case "Policy":
					toReturn.Add(PolicyLinkEntity.Relations.PolicyEntityUsingPolicyId);
					break;
				case "Parent":
					toReturn.Add(PolicyLinkEntity.Relations.PolicyLinkEntityUsingIdParentId);
					break;
				case "PolicyDocument":
					toReturn.Add(PolicyLinkEntity.Relations.PolicyDocumentEntityUsingPolicyLinkId);
					break;
				case "Children":
					toReturn.Add(PolicyLinkEntity.Relations.PolicyLinkEntityUsingParentId);
					break;
				case "LibraryCollectionViaPolicyDocument":
					toReturn.Add(PolicyLinkEntity.Relations.PolicyDocumentEntityUsingPolicyLinkId, "PolicyLinkEntity__", "PolicyDocument_", JoinHint.None);
					toReturn.Add(PolicyDocumentEntity.Relations.LibraryEntityUsingLibraryId, "PolicyDocument_", string.Empty, JoinHint.None);
					break;
				case "PolicyCollectionViaPolicyLink":
					toReturn.Add(PolicyLinkEntity.Relations.PolicyLinkEntityUsingParentId, "PolicyLinkEntity__", "PolicyLink_", JoinHint.None);
					toReturn.Add(PolicyLinkEntity.Relations.PolicyEntityUsingPolicyId, "PolicyLink_", string.Empty, JoinHint.None);
					break;

				default:

					break;				
			}
			return toReturn;
		}



		/// <summary> ISerializable member. Does custom serialization so event handlers do not get serialized.
		/// Serializes members of this entity class and uses the base class' implementation to serialize the rest.</summary>
		/// <param name="info"></param>
		/// <param name="context"></param>
		[EditorBrowsable(EditorBrowsableState.Never)]
		public override void GetObjectData(SerializationInfo info, StreamingContext context)
		{
			info.AddValue("_policyDocument", (!this.MarkedForDeletion?_policyDocument:null));
			info.AddValue("_alwaysFetchPolicyDocument", _alwaysFetchPolicyDocument);
			info.AddValue("_alreadyFetchedPolicyDocument", _alreadyFetchedPolicyDocument);
			info.AddValue("_children", (!this.MarkedForDeletion?_children:null));
			info.AddValue("_alwaysFetchChildren", _alwaysFetchChildren);
			info.AddValue("_alreadyFetchedChildren", _alreadyFetchedChildren);
			info.AddValue("_libraryCollectionViaPolicyDocument", (!this.MarkedForDeletion?_libraryCollectionViaPolicyDocument:null));
			info.AddValue("_alwaysFetchLibraryCollectionViaPolicyDocument", _alwaysFetchLibraryCollectionViaPolicyDocument);
			info.AddValue("_alreadyFetchedLibraryCollectionViaPolicyDocument", _alreadyFetchedLibraryCollectionViaPolicyDocument);
			info.AddValue("_policyCollectionViaPolicyLink", (!this.MarkedForDeletion?_policyCollectionViaPolicyLink:null));
			info.AddValue("_alwaysFetchPolicyCollectionViaPolicyLink", _alwaysFetchPolicyCollectionViaPolicyLink);
			info.AddValue("_alreadyFetchedPolicyCollectionViaPolicyLink", _alreadyFetchedPolicyCollectionViaPolicyLink);
			info.AddValue("_policy", (!this.MarkedForDeletion?_policy:null));
			info.AddValue("_policyReturnsNewIfNotFound", _policyReturnsNewIfNotFound);
			info.AddValue("_alwaysFetchPolicy", _alwaysFetchPolicy);
			info.AddValue("_alreadyFetchedPolicy", _alreadyFetchedPolicy);
			info.AddValue("_parent", (!this.MarkedForDeletion?_parent:null));
			info.AddValue("_parentReturnsNewIfNotFound", _parentReturnsNewIfNotFound);
			info.AddValue("_alwaysFetchParent", _alwaysFetchParent);
			info.AddValue("_alreadyFetchedParent", _alreadyFetchedParent);

			
			// __LLBLGENPRO_USER_CODE_REGION_START GetObjectInfo
			// __LLBLGENPRO_USER_CODE_REGION_END
			base.GetObjectData(info, context);
		}
		
		/// <summary> Sets the related entity property to the entity specified. If the property is a collection, it will add the entity specified to that collection.</summary>
		/// <param name="propertyName">Name of the property.</param>
		/// <param name="entity">Entity to set as an related entity</param>
		/// <remarks>Used by prefetch path logic.</remarks>
		[EditorBrowsable(EditorBrowsableState.Never)]
		public override void SetRelatedEntityProperty(string propertyName, IEntity entity)
		{
			switch(propertyName)
			{
				case "Policy":
					_alreadyFetchedPolicy = true;
					this.Policy = (PolicyEntity)entity;
					break;
				case "Parent":
					_alreadyFetchedParent = true;
					this.Parent = (PolicyLinkEntity)entity;
					break;
				case "PolicyDocument":
					_alreadyFetchedPolicyDocument = true;
					if(entity!=null)
					{
						this.PolicyDocument.Add((PolicyDocumentEntity)entity);
					}
					break;
				case "Children":
					_alreadyFetchedChildren = true;
					if(entity!=null)
					{
						this.Children.Add((PolicyLinkEntity)entity);
					}
					break;
				case "LibraryCollectionViaPolicyDocument":
					_alreadyFetchedLibraryCollectionViaPolicyDocument = true;
					if(entity!=null)
					{
						this.LibraryCollectionViaPolicyDocument.Add((LibraryEntity)entity);
					}
					break;
				case "PolicyCollectionViaPolicyLink":
					_alreadyFetchedPolicyCollectionViaPolicyLink = true;
					if(entity!=null)
					{
						this.PolicyCollectionViaPolicyLink.Add((PolicyEntity)entity);
					}
					break;

				default:

					break;
			}
		}

		/// <summary> Sets the internal parameter related to the fieldname passed to the instance relatedEntity. </summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		/// <param name="fieldName">Name of field mapped onto the relation which resolves in the instance relatedEntity</param>
		[EditorBrowsable(EditorBrowsableState.Never)]
		public override void SetRelatedEntity(IEntity relatedEntity, string fieldName)
		{
			switch(fieldName)
			{
				case "Policy":
					SetupSyncPolicy(relatedEntity);
					break;
				case "Parent":
					SetupSyncParent(relatedEntity);
					break;
				case "PolicyDocument":
					_policyDocument.Add((PolicyDocumentEntity)relatedEntity);
					break;
				case "Children":
					_children.Add((PolicyLinkEntity)relatedEntity);
					break;

				default:

					break;
			}
		}
		
		/// <summary> Unsets the internal parameter related to the fieldname passed to the instance relatedEntity. Reverses the actions taken by SetRelatedEntity() </summary>
		/// <param name="relatedEntity">Instance to unset as the related entity of type entityType</param>
		/// <param name="fieldName">Name of field mapped onto the relation which resolves in the instance relatedEntity</param>
		/// <param name="signalRelatedEntityManyToOne">if set to true it will notify the manytoone side, if applicable.</param>
		[EditorBrowsable(EditorBrowsableState.Never)]
		public override void UnsetRelatedEntity(IEntity relatedEntity, string fieldName, bool signalRelatedEntityManyToOne)
		{
			switch(fieldName)
			{
				case "Policy":
					DesetupSyncPolicy(false, true);
					break;
				case "Parent":
					DesetupSyncParent(false, true);
					break;
				case "PolicyDocument":
					base.PerformRelatedEntityRemoval(_policyDocument, relatedEntity, signalRelatedEntityManyToOne);
					break;
				case "Children":
					base.PerformRelatedEntityRemoval(_children, relatedEntity, signalRelatedEntityManyToOne);
					break;

				default:

					break;
			}
		}

		/// <summary> Gets a collection of related entities referenced by this entity which depend on this entity (this entity is the PK side of their FK fields). These
		/// entities will have to be persisted after this entity during a recursive save.</summary>
		/// <returns>Collection with 0 or more IEntity objects, referenced by this entity</returns>
		public override List<IEntity> GetDependingRelatedEntities()
		{
			List<IEntity> toReturn = new List<IEntity>();


			return toReturn;
		}
		
		/// <summary> Gets a collection of related entities referenced by this entity which this entity depends on (this entity is the FK side of their PK fields). These
		/// entities will have to be persisted before this entity during a recursive save.</summary>
		/// <returns>Collection with 0 or more IEntity objects, referenced by this entity</returns>
		public override List<IEntity> GetDependentRelatedEntities()
		{
			List<IEntity> toReturn = new List<IEntity>();
			if(_policy!=null)
			{
				toReturn.Add(_policy);
			}
			if(_parent!=null)
			{
				toReturn.Add(_parent);
			}


			return toReturn;
		}
		
		/// <summary> Gets a List of all entity collections stored as member variables in this entity. The contents of the ArrayList is
		/// used by the DataAccessAdapter to perform recursive saves. Only 1:n related collections are returned.</summary>
		/// <returns>Collection with 0 or more IEntityCollection objects, referenced by this entity</returns>
		public override List<IEntityCollection> GetMemberEntityCollections()
		{
			List<IEntityCollection> toReturn = new List<IEntityCollection>();
			toReturn.Add(_policyDocument);
			toReturn.Add(_children);

			return toReturn;
		}

		

		

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for PolicyLink which data should be fetched into this PolicyLink object</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id)
		{
			return FetchUsingPK(id, null, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for PolicyLink which data should be fetched into this PolicyLink object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			return FetchUsingPK(id, prefetchPathToUse, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for PolicyLink which data should be fetched into this PolicyLink object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse, Context contextToUse)
		{
			return Fetch(id, prefetchPathToUse, contextToUse, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for PolicyLink which data should be fetched into this PolicyLink object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <param name="excludedIncludedFields">The list of IEntityField objects which have to be excluded or included for the fetch. 
		/// If null or empty, all fields are fetched (default). If an instance of ExcludeIncludeFieldsList is passed in and its ExcludeContainedFields property
		/// is set to false, the fields contained in excludedIncludedFields are kept in the query, the rest of the fields in the query are excluded.</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse, Context contextToUse, ExcludeIncludeFieldsList excludedIncludedFields)
		{
			return Fetch(id, prefetchPathToUse, contextToUse, excludedIncludedFields);
		}

		/// <summary> Refetches the Entity from the persistent storage. Refetch is used to re-load an Entity which is marked "Out-of-sync", due to a save action. 
		/// Refetching an empty Entity has no effect. </summary>
		/// <returns>true if Refetch succeeded, false otherwise</returns>
		public override bool Refetch()
		{
			return Fetch(this.Id, null, null, null);
		}

		/// <summary> Returns true if the original value for the field with the fieldIndex passed in, read from the persistent storage was NULL, false otherwise.
		/// Should not be used for testing if the current value is NULL, use <see cref="TestCurrentFieldValueForNull"/> for that.</summary>
		/// <param name="fieldIndex">Index of the field to test if that field was NULL in the persistent storage</param>
		/// <returns>true if the field with the passed in index was NULL in the persistent storage, false otherwise</returns>
		public bool TestOriginalFieldValueForNull(PolicyLinkFieldIndex fieldIndex)
		{
			return base.Fields[(int)fieldIndex].IsNull;
		}
		
		/// <summary>Returns true if the current value for the field with the fieldIndex passed in represents null/not defined, false otherwise.
		/// Should not be used for testing if the original value (read from the db) is NULL</summary>
		/// <param name="fieldIndex">Index of the field to test if its currentvalue is null/undefined</param>
		/// <returns>true if the field's value isn't defined yet, false otherwise</returns>
		public bool TestCurrentFieldValueForNull(PolicyLinkFieldIndex fieldIndex)
		{
			return base.CheckIfCurrentFieldValueIsNull((int)fieldIndex);
		}

				
		/// <summary>Gets a list of all the EntityRelation objects the type of this instance has.</summary>
		/// <returns>A list of all the EntityRelation objects the type of this instance has. Hierarchy relations are excluded.</returns>
		public override List<IEntityRelation> GetAllRelations()
		{
			return new PolicyLinkRelations().GetAllRelations();
		}


		/// <summary> Retrieves all related entities of type 'PolicyDocumentEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'PolicyDocumentEntity'</returns>
		public policyDB.CollectionClasses.PolicyDocumentCollection GetMultiPolicyDocument(bool forceFetch)
		{
			return GetMultiPolicyDocument(forceFetch, _policyDocument.EntityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'PolicyDocumentEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of type 'PolicyDocumentEntity'</returns>
		public policyDB.CollectionClasses.PolicyDocumentCollection GetMultiPolicyDocument(bool forceFetch, IPredicateExpression filter)
		{
			return GetMultiPolicyDocument(forceFetch, _policyDocument.EntityFactoryToUse, filter);
		}

		/// <summary> Retrieves all related entities of type 'PolicyDocumentEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.PolicyDocumentCollection GetMultiPolicyDocument(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
			return GetMultiPolicyDocument(forceFetch, entityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'PolicyDocumentEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public virtual policyDB.CollectionClasses.PolicyDocumentCollection GetMultiPolicyDocument(bool forceFetch, IEntityFactory entityFactoryToUse, IPredicateExpression filter)
		{
 			if( ( !_alreadyFetchedPolicyDocument || forceFetch || _alwaysFetchPolicyDocument) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_policyDocument.ParticipatesInTransaction)
					{
						base.Transaction.Add(_policyDocument);
					}
				}
				_policyDocument.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_policyDocument.EntityFactoryToUse = entityFactoryToUse;
				}
				_policyDocument.GetMultiManyToOne(null, this, filter);
				_policyDocument.SuppressClearInGetMulti=false;
				_alreadyFetchedPolicyDocument = true;
			}
			return _policyDocument;
		}

		/// <summary> Sets the collection parameters for the collection for 'PolicyDocument'. These settings will be taken into account
		/// when the property PolicyDocument is requested or GetMultiPolicyDocument is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersPolicyDocument(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_policyDocument.SortClauses=sortClauses;
			_policyDocument.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'PolicyLinkEntity'</returns>
		public policyDB.CollectionClasses.PolicyLinkCollection GetMultiChildren(bool forceFetch)
		{
			return GetMultiChildren(forceFetch, _children.EntityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of type 'PolicyLinkEntity'</returns>
		public policyDB.CollectionClasses.PolicyLinkCollection GetMultiChildren(bool forceFetch, IPredicateExpression filter)
		{
			return GetMultiChildren(forceFetch, _children.EntityFactoryToUse, filter);
		}

		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.PolicyLinkCollection GetMultiChildren(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
			return GetMultiChildren(forceFetch, entityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public virtual policyDB.CollectionClasses.PolicyLinkCollection GetMultiChildren(bool forceFetch, IEntityFactory entityFactoryToUse, IPredicateExpression filter)
		{
 			if( ( !_alreadyFetchedChildren || forceFetch || _alwaysFetchChildren) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_children.ParticipatesInTransaction)
					{
						base.Transaction.Add(_children);
					}
				}
				_children.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_children.EntityFactoryToUse = entityFactoryToUse;
				}
				_children.GetMultiManyToOne(null, this, filter);
				_children.SuppressClearInGetMulti=false;
				_alreadyFetchedChildren = true;
			}
			return _children;
		}

		/// <summary> Sets the collection parameters for the collection for 'Children'. These settings will be taken into account
		/// when the property Children is requested or GetMultiChildren is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersChildren(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_children.SortClauses=sortClauses;
			_children.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'LibraryEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'LibraryEntity'</returns>
		public policyDB.CollectionClasses.LibraryCollection GetMultiLibraryCollectionViaPolicyDocument(bool forceFetch)
		{
			return GetMultiLibraryCollectionViaPolicyDocument(forceFetch, _libraryCollectionViaPolicyDocument.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'LibraryEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.LibraryCollection GetMultiLibraryCollectionViaPolicyDocument(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedLibraryCollectionViaPolicyDocument || forceFetch || _alwaysFetchLibraryCollectionViaPolicyDocument) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_libraryCollectionViaPolicyDocument.ParticipatesInTransaction)
					{
						base.Transaction.Add(_libraryCollectionViaPolicyDocument);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(PolicyLinkFields.Id, ComparisonOperator.Equal, this.Id, "PolicyLinkEntity__"));
				_libraryCollectionViaPolicyDocument.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_libraryCollectionViaPolicyDocument.EntityFactoryToUse = entityFactoryToUse;
				}
				_libraryCollectionViaPolicyDocument.GetMulti(filter, GetRelationsForField("LibraryCollectionViaPolicyDocument"));
				_libraryCollectionViaPolicyDocument.SuppressClearInGetMulti=false;
				_alreadyFetchedLibraryCollectionViaPolicyDocument = true;
			}
			return _libraryCollectionViaPolicyDocument;
		}

		/// <summary> Sets the collection parameters for the collection for 'LibraryCollectionViaPolicyDocument'. These settings will be taken into account
		/// when the property LibraryCollectionViaPolicyDocument is requested or GetMultiLibraryCollectionViaPolicyDocument is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersLibraryCollectionViaPolicyDocument(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_libraryCollectionViaPolicyDocument.SortClauses=sortClauses;
			_libraryCollectionViaPolicyDocument.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'PolicyEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'PolicyEntity'</returns>
		public policyDB.CollectionClasses.PolicyCollection GetMultiPolicyCollectionViaPolicyLink(bool forceFetch)
		{
			return GetMultiPolicyCollectionViaPolicyLink(forceFetch, _policyCollectionViaPolicyLink.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'PolicyEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.PolicyCollection GetMultiPolicyCollectionViaPolicyLink(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedPolicyCollectionViaPolicyLink || forceFetch || _alwaysFetchPolicyCollectionViaPolicyLink) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_policyCollectionViaPolicyLink.ParticipatesInTransaction)
					{
						base.Transaction.Add(_policyCollectionViaPolicyLink);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(PolicyLinkFields.Id, ComparisonOperator.Equal, this.Id, "PolicyLinkEntity__"));
				_policyCollectionViaPolicyLink.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_policyCollectionViaPolicyLink.EntityFactoryToUse = entityFactoryToUse;
				}
				_policyCollectionViaPolicyLink.GetMulti(filter, GetRelationsForField("PolicyCollectionViaPolicyLink"));
				_policyCollectionViaPolicyLink.SuppressClearInGetMulti=false;
				_alreadyFetchedPolicyCollectionViaPolicyLink = true;
			}
			return _policyCollectionViaPolicyLink;
		}

		/// <summary> Sets the collection parameters for the collection for 'PolicyCollectionViaPolicyLink'. These settings will be taken into account
		/// when the property PolicyCollectionViaPolicyLink is requested or GetMultiPolicyCollectionViaPolicyLink is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersPolicyCollectionViaPolicyLink(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_policyCollectionViaPolicyLink.SortClauses=sortClauses;
			_policyCollectionViaPolicyLink.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves the related entity of type 'PolicyEntity', using a relation of type 'n:1'</summary>
		/// <returns>A fetched entity of type 'PolicyEntity' which is related to this entity.</returns>
		public PolicyEntity GetSinglePolicy()
		{
			return GetSinglePolicy(false);
		}

		/// <summary> Retrieves the related entity of type 'PolicyEntity', using a relation of type 'n:1'</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the currently loaded related entity and will refetch the entity from the persistent storage</param>
		/// <returns>A fetched entity of type 'PolicyEntity' which is related to this entity.</returns>
		public virtual PolicyEntity GetSinglePolicy(bool forceFetch)
		{
			if( ( !_alreadyFetchedPolicy || forceFetch || _alwaysFetchPolicy) && !base.IsSerializing && !base.IsDeserializing  && !base.InDesignMode)			
			{
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(PolicyLinkEntity.Relations.PolicyEntityUsingPolicyId);

				PolicyEntity newEntity = new PolicyEntity();
				if(base.ParticipatesInTransaction)
				{
					base.Transaction.Add(newEntity);
				}
				bool fetchResult = false;
				if(performLazyLoading)
				{
					fetchResult = newEntity.FetchUsingPK(this.PolicyId);
				}
				if(fetchResult)
				{
					if(base.ActiveContext!=null)
					{
						newEntity = (PolicyEntity)base.ActiveContext.Get(newEntity);
					}
					this.Policy = newEntity;
				}
				else
				{
					if(_policyReturnsNewIfNotFound)
					{
						if(performLazyLoading || (!performLazyLoading && (_policy == null)))
						{
							this.Policy = newEntity;
						}
					}
					else
					{
						this.Policy = null;
					}
				}
				_alreadyFetchedPolicy = fetchResult;
				if(base.ParticipatesInTransaction && !fetchResult)
				{
					base.Transaction.Remove(newEntity);
				}
			}
			return _policy;
		}

		/// <summary> Retrieves the related entity of type 'PolicyLinkEntity', using a relation of type 'n:1'</summary>
		/// <returns>A fetched entity of type 'PolicyLinkEntity' which is related to this entity.</returns>
		public PolicyLinkEntity GetSingleParent()
		{
			return GetSingleParent(false);
		}

		/// <summary> Retrieves the related entity of type 'PolicyLinkEntity', using a relation of type 'n:1'</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the currently loaded related entity and will refetch the entity from the persistent storage</param>
		/// <returns>A fetched entity of type 'PolicyLinkEntity' which is related to this entity.</returns>
		public virtual PolicyLinkEntity GetSingleParent(bool forceFetch)
		{
			if( ( !_alreadyFetchedParent || forceFetch || _alwaysFetchParent) && !base.IsSerializing && !base.IsDeserializing  && !base.InDesignMode)			
			{
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(PolicyLinkEntity.Relations.PolicyLinkEntityUsingIdParentId);

				PolicyLinkEntity newEntity = new PolicyLinkEntity();
				if(base.ParticipatesInTransaction)
				{
					base.Transaction.Add(newEntity);
				}
				bool fetchResult = false;
				if(performLazyLoading)
				{
					fetchResult = newEntity.FetchUsingPK(this.ParentId.GetValueOrDefault());
				}
				if(fetchResult)
				{
					if(base.ActiveContext!=null)
					{
						newEntity = (PolicyLinkEntity)base.ActiveContext.Get(newEntity);
					}
					this.Parent = newEntity;
				}
				else
				{
					if(_parentReturnsNewIfNotFound)
					{
						if(performLazyLoading || (!performLazyLoading && (_parent == null)))
						{
							this.Parent = newEntity;
						}
					}
					else
					{
						this.Parent = null;
					}
				}
				_alreadyFetchedParent = fetchResult;
				if(base.ParticipatesInTransaction && !fetchResult)
				{
					base.Transaction.Remove(newEntity);
				}
			}
			return _parent;
		}


		/// <summary> Performs the insert action of a new Entity to the persistent storage.</summary>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool InsertEntity()
		{
			PolicyLinkDAO dao = (PolicyLinkDAO)CreateDAOInstance();
			return dao.AddNew(base.Fields, base.Transaction);
		}
		
		/// <summary> Adds the internals to the active context. </summary>
		protected override void AddInternalsToContext()
		{
			_policyDocument.ActiveContext = base.ActiveContext;
			_children.ActiveContext = base.ActiveContext;
			_libraryCollectionViaPolicyDocument.ActiveContext = base.ActiveContext;
			_policyCollectionViaPolicyLink.ActiveContext = base.ActiveContext;
			if(_policy!=null)
			{
				_policy.ActiveContext = base.ActiveContext;
			}
			if(_parent!=null)
			{
				_parent.ActiveContext = base.ActiveContext;
			}


		}


		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity()
		{
			PolicyLinkDAO dao = (PolicyLinkDAO)CreateDAOInstance();
			return dao.UpdateExisting(base.Fields, base.Transaction);
		}
		
		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <param name="updateRestriction">Predicate expression, meant for concurrency checks in an Update query</param>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity(IPredicate updateRestriction)
		{
			PolicyLinkDAO dao = (PolicyLinkDAO)CreateDAOInstance();
			return dao.UpdateExisting(base.Fields, base.Transaction, updateRestriction);
		}
	
		/// <summary> Initializes the class with empty data, as if it is a new Entity.</summary>
		/// <param name="validatorToUse">Validator to use.</param>
		protected virtual void InitClassEmpty(IValidator validatorToUse)
		{
			OnInitializing();
			base.Fields = CreateFields();
			base.IsNew=true;
			base.Validator = validatorToUse;

			InitClassMembers();
			
			// __LLBLGENPRO_USER_CODE_REGION_START InitClassEmpty
			// __LLBLGENPRO_USER_CODE_REGION_END

			OnInitialized();
		}
		
		/// <summary>Creates entity fields object for this entity. Used in constructor to setup this entity in a polymorphic scenario.</summary>
		protected virtual IEntityFields CreateFields()
		{
			return EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.PolicyLinkEntity);
		}
		
		/// <summary>Creates a new transaction object</summary>
		/// <param name="levelOfIsolation">The level of isolation.</param>
		/// <param name="name">The name.</param>
		protected override ITransaction CreateTransaction( IsolationLevel levelOfIsolation, string name )
		{
			return new Transaction(levelOfIsolation, name);
		}

		/// <summary>
		/// Creates the ITypeDefaultValue instance used to provide default values for value types which aren't of type nullable(of T)
		/// </summary>
		/// <returns></returns>
		protected override ITypeDefaultValue CreateTypeDefaultValueProvider()
		{
			return new TypeDefaultValue();
		}

		/// <summary>
		/// Gets all related data objects, stored by name. The name is the field name mapped onto the relation for that particular data element. 
		/// </summary>
		/// <returns>Dictionary with per name the related referenced data element, which can be an entity collection or an entity or null</returns>
		public override Dictionary<string, object> GetRelatedData()
		{
			Dictionary<string, object> toReturn = new Dictionary<string, object>();
			toReturn.Add("Policy", _policy);
			toReturn.Add("Parent", _parent);
			toReturn.Add("PolicyDocument", _policyDocument);
			toReturn.Add("Children", _children);
			toReturn.Add("LibraryCollectionViaPolicyDocument", _libraryCollectionViaPolicyDocument);
			toReturn.Add("PolicyCollectionViaPolicyLink", _policyCollectionViaPolicyLink);

			return toReturn;
		}
		

		/// <summary> Initializes the the entity and fetches the data related to the entity in this entity.</summary>
		/// <param name="id">PK value for PolicyLink which data should be fetched into this PolicyLink object</param>
		/// <param name="validator">The validator object for this PolicyLinkEntity</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		protected virtual void InitClassFetch(System.Int32 id, IValidator validator, IPrefetchPath prefetchPathToUse)
		{
			OnInitializing();
			base.Validator = validator;
			InitClassMembers();
			base.Fields = CreateFields();
			bool wasSuccesful = Fetch(id, prefetchPathToUse, null, null);
			base.IsNew = !wasSuccesful;

			
			// __LLBLGENPRO_USER_CODE_REGION_START InitClassFetch
			// __LLBLGENPRO_USER_CODE_REGION_END

			OnInitialized();
		}

		/// <summary> Initializes the class members</summary>
		private void InitClassMembers()
		{
			_policyDocument = new policyDB.CollectionClasses.PolicyDocumentCollection(new PolicyDocumentEntityFactory());
			_policyDocument.SetContainingEntityInfo(this, "PolicyLink");
			_alwaysFetchPolicyDocument = false;
			_alreadyFetchedPolicyDocument = false;
			_children = new policyDB.CollectionClasses.PolicyLinkCollection(new PolicyLinkEntityFactory());
			_children.SetContainingEntityInfo(this, "Parent");
			_alwaysFetchChildren = false;
			_alreadyFetchedChildren = false;
			_libraryCollectionViaPolicyDocument = new policyDB.CollectionClasses.LibraryCollection(new LibraryEntityFactory());
			_alwaysFetchLibraryCollectionViaPolicyDocument = false;
			_alreadyFetchedLibraryCollectionViaPolicyDocument = false;
			_policyCollectionViaPolicyLink = new policyDB.CollectionClasses.PolicyCollection(new PolicyEntityFactory());
			_alwaysFetchPolicyCollectionViaPolicyLink = false;
			_alreadyFetchedPolicyCollectionViaPolicyLink = false;
			_policy = null;
			_policyReturnsNewIfNotFound = true;
			_alwaysFetchPolicy = false;
			_alreadyFetchedPolicy = false;
			_parent = null;
			_parentReturnsNewIfNotFound = true;
			_alwaysFetchParent = false;
			_alreadyFetchedParent = false;


			PerformDependencyInjection();
			
			// __LLBLGENPRO_USER_CODE_REGION_START InitClassMembers
			// __LLBLGENPRO_USER_CODE_REGION_END
			OnInitClassMembersComplete();
		}

		#region Custom Property Hashtable Setup
		/// <summary> Initializes the hashtables for the entity type and entity field custom properties. </summary>
		private static void SetupCustomPropertyHashtables()
		{
			_customProperties = new Dictionary<string, string>();
			_fieldsCustomProperties = new Dictionary<string, Dictionary<string, string>>();

			Dictionary<string, string> fieldHashtable = null;
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("Id", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("PolicyId", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("ParentId", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("Order", fieldHashtable);
		}
		#endregion


		/// <summary> Removes the sync logic for member _policy</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncPolicy(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _policy, new PropertyChangedEventHandler( OnPolicyPropertyChanged ), "Policy", PolicyLinkEntity.Relations.PolicyEntityUsingPolicyId, true, signalRelatedEntity, "PolicyLink", resetFKFields, new int[] { (int)PolicyLinkFieldIndex.PolicyId } );		
			_policy = null;
		}
		
		/// <summary> setups the sync logic for member _policy</summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		private void SetupSyncPolicy(IEntity relatedEntity)
		{
			if(_policy!=relatedEntity)
			{		
				DesetupSyncPolicy(true, true);
				_policy = (PolicyEntity)relatedEntity;
				base.PerformSetupSyncRelatedEntity( _policy, new PropertyChangedEventHandler( OnPolicyPropertyChanged ), "Policy", PolicyLinkEntity.Relations.PolicyEntityUsingPolicyId, true, ref _alreadyFetchedPolicy, new string[] {  } );
			}
		}

		/// <summary>Handles property change events of properties in a related entity.</summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void OnPolicyPropertyChanged( object sender, PropertyChangedEventArgs e )
		{
			switch( e.PropertyName )
			{
				default:
					break;
			}
		}

		/// <summary> Removes the sync logic for member _parent</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncParent(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _parent, new PropertyChangedEventHandler( OnParentPropertyChanged ), "Parent", PolicyLinkEntity.Relations.PolicyLinkEntityUsingIdParentId, true, signalRelatedEntity, "Children", resetFKFields, new int[] { (int)PolicyLinkFieldIndex.ParentId } );		
			_parent = null;
		}
		
		/// <summary> setups the sync logic for member _parent</summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		private void SetupSyncParent(IEntity relatedEntity)
		{
			if(_parent!=relatedEntity)
			{		
				DesetupSyncParent(true, true);
				_parent = (PolicyLinkEntity)relatedEntity;
				base.PerformSetupSyncRelatedEntity( _parent, new PropertyChangedEventHandler( OnParentPropertyChanged ), "Parent", PolicyLinkEntity.Relations.PolicyLinkEntityUsingIdParentId, true, ref _alreadyFetchedParent, new string[] {  } );
			}
		}

		/// <summary>Handles property change events of properties in a related entity.</summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void OnParentPropertyChanged( object sender, PropertyChangedEventArgs e )
		{
			switch( e.PropertyName )
			{
				default:
					break;
			}
		}


		/// <summary> Fetches the entity from the persistent storage. Fetch simply reads the entity into an EntityFields object. </summary>
		/// <param name="id">PK value for PolicyLink which data should be fetched into this PolicyLink object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <param name="excludedIncludedFields">The list of IEntityField objects which have to be excluded or included for the fetch. 
		/// If null or empty, all fields are fetched (default). If an instance of ExcludeIncludeFieldsList is passed in and its ExcludeContainedFields property
		/// is set to false, the fields contained in excludedIncludedFields are kept in the query, the rest of the fields in the query are excluded.</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		private bool Fetch(System.Int32 id, IPrefetchPath prefetchPathToUse, Context contextToUse, ExcludeIncludeFieldsList excludedIncludedFields)
		{
			try
			{
				OnFetch();
				IDao dao = this.CreateDAOInstance();
				base.Fields[(int)PolicyLinkFieldIndex.Id].ForcedCurrentValueWrite(id);
				dao.FetchExisting(this, base.Transaction, prefetchPathToUse, contextToUse, excludedIncludedFields);
				return (base.Fields.State == EntityState.Fetched);
			}
			finally
			{
				OnFetchComplete();
			}
		}


		/// <summary> Creates the DAO instance for this type</summary>
		/// <returns></returns>
		protected override IDao CreateDAOInstance()
		{
			return DAOFactory.CreatePolicyLinkDAO();
		}
		
		/// <summary> Creates the entity factory for this type.</summary>
		/// <returns></returns>
		protected override IEntityFactory CreateEntityFactory()
		{
			return new PolicyLinkEntityFactory();
		}

		#region Class Property Declarations
		/// <summary> The relations object holding all relations of this entity with other entity classes.</summary>
		public  static PolicyLinkRelations Relations
		{
			get	{ return new PolicyLinkRelations(); }
		}
		
		/// <summary> The custom properties for this entity type.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		public  static Dictionary<string, string> CustomProperties
		{
			get { return _customProperties;}
		}


		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'PolicyDocument' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathPolicyDocument
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.PolicyDocumentCollection(),
					(IEntityRelation)GetRelationsForField("PolicyDocument")[0], (int)policyDB.EntityType.PolicyLinkEntity, (int)policyDB.EntityType.PolicyDocumentEntity, 0, null, null, null, "PolicyDocument", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'PolicyLink' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathChildren
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.PolicyLinkCollection(),
					(IEntityRelation)GetRelationsForField("Children")[0], (int)policyDB.EntityType.PolicyLinkEntity, (int)policyDB.EntityType.PolicyLinkEntity, 0, null, null, null, "Children", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Library' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathLibraryCollectionViaPolicyDocument
		{
			get
			{
				IEntityRelation intermediateRelation = PolicyLinkEntity.Relations.PolicyDocumentEntityUsingPolicyLinkId;
				intermediateRelation.SetAliases(string.Empty, "PolicyDocument_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.LibraryCollection(), intermediateRelation,
					(int)policyDB.EntityType.PolicyLinkEntity, (int)policyDB.EntityType.LibraryEntity, 0, null, null, GetRelationsForField("LibraryCollectionViaPolicyDocument"), "LibraryCollectionViaPolicyDocument", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Policy' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathPolicyCollectionViaPolicyLink
		{
			get
			{
				IEntityRelation intermediateRelation = PolicyLinkEntity.Relations.PolicyLinkEntityUsingParentId;
				intermediateRelation.SetAliases(string.Empty, "PolicyLink_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.PolicyCollection(), intermediateRelation,
					(int)policyDB.EntityType.PolicyLinkEntity, (int)policyDB.EntityType.PolicyEntity, 0, null, null, GetRelationsForField("PolicyCollectionViaPolicyLink"), "PolicyCollectionViaPolicyLink", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Policy' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathPolicy
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.PolicyCollection(),
					(IEntityRelation)GetRelationsForField("Policy")[0], (int)policyDB.EntityType.PolicyLinkEntity, (int)policyDB.EntityType.PolicyEntity, 0, null, null, null, "Policy", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'PolicyLink' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathParent
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.PolicyLinkCollection(),
					(IEntityRelation)GetRelationsForField("Parent")[0], (int)policyDB.EntityType.PolicyLinkEntity, (int)policyDB.EntityType.PolicyLinkEntity, 0, null, null, null, "Parent", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
			}
		}


		/// <summary>Returns the full name for this entity, which is important for the DAO to find back persistence info for this entity.</summary>
		[Browsable(false), XmlIgnore]
		public override string LLBLGenProEntityName
		{
			get { return "PolicyLinkEntity";}
		}

		/// <summary> The custom properties for the type of this entity instance.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		[Browsable(false), XmlIgnore]
		public override Dictionary<string, string> CustomPropertiesOfType
		{
			get { return PolicyLinkEntity.CustomProperties;}
		}

		/// <summary> The custom properties for the fields of this entity type. The returned Hashtable contains per fieldname a hashtable of name-value pairs. </summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		public  static Dictionary<string, Dictionary<string, string>> FieldsCustomProperties
		{
			get { return _fieldsCustomProperties;}
		}

		/// <summary> The custom properties for the fields of the type of this entity instance. The returned Hashtable contains per fieldname a hashtable of name-value pairs. </summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		[Browsable(false), XmlIgnore]
		public override Dictionary<string, Dictionary<string, string>> FieldsCustomPropertiesOfType
		{
			get { return PolicyLinkEntity.FieldsCustomProperties;}
		}

		/// <summary> The Id property of the Entity PolicyLink<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "policyLink"."id"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, true, true</remarks>
		public virtual System.Int32 Id
		{
			get { return (System.Int32)GetValue((int)PolicyLinkFieldIndex.Id, true); }
			set	{ SetValue((int)PolicyLinkFieldIndex.Id, value, true); }
		}
		/// <summary> The PolicyId property of the Entity PolicyLink<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "policyLink"."policyId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Int32 PolicyId
		{
			get { return (System.Int32)GetValue((int)PolicyLinkFieldIndex.PolicyId, true); }
			set	{ SetValue((int)PolicyLinkFieldIndex.PolicyId, value, true); }
		}
		/// <summary> The ParentId property of the Entity PolicyLink<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "policyLink"."parentId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): true, false, false</remarks>
		public virtual Nullable<System.Int32> ParentId
		{
			get { return (Nullable<System.Int32>)GetValue((int)PolicyLinkFieldIndex.ParentId, false); }
			set	{ SetValue((int)PolicyLinkFieldIndex.ParentId, value, true); }
		}
		/// <summary> The Order property of the Entity PolicyLink<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "policyLink"."order"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Int32 Order
		{
			get { return (System.Int32)GetValue((int)PolicyLinkFieldIndex.Order, true); }
			set	{ SetValue((int)PolicyLinkFieldIndex.Order, value, true); }
		}

		/// <summary> Retrieves all related entities of type 'PolicyDocumentEntity' using a relation of type '1:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiPolicyDocument()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.PolicyDocumentCollection PolicyDocument
		{
			get	{ return GetMultiPolicyDocument(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for PolicyDocument. When set to true, PolicyDocument is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time PolicyDocument is accessed. You can always execute
		/// a forced fetch by calling GetMultiPolicyDocument(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchPolicyDocument
		{
			get	{ return _alwaysFetchPolicyDocument; }
			set	{ _alwaysFetchPolicyDocument = value; }	
		}		
				
		/// <summary>Gets / Sets the lazy loading flag if the property PolicyDocument already has been fetched. Setting this property to false when PolicyDocument has been fetched
		/// will clear the PolicyDocument collection well. Setting this property to true while PolicyDocument hasn't been fetched disables lazy loading for PolicyDocument</summary>
		[Browsable(false)]
		public bool AlreadyFetchedPolicyDocument
		{
			get { return _alreadyFetchedPolicyDocument;}
			set 
			{
				if(_alreadyFetchedPolicyDocument && !value && (_policyDocument != null))
				{
					_policyDocument.Clear();
				}
				_alreadyFetchedPolicyDocument = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type '1:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiChildren()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.PolicyLinkCollection Children
		{
			get	{ return GetMultiChildren(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for Children. When set to true, Children is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Children is accessed. You can always execute
		/// a forced fetch by calling GetMultiChildren(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchChildren
		{
			get	{ return _alwaysFetchChildren; }
			set	{ _alwaysFetchChildren = value; }	
		}		
				
		/// <summary>Gets / Sets the lazy loading flag if the property Children already has been fetched. Setting this property to false when Children has been fetched
		/// will clear the Children collection well. Setting this property to true while Children hasn't been fetched disables lazy loading for Children</summary>
		[Browsable(false)]
		public bool AlreadyFetchedChildren
		{
			get { return _alreadyFetchedChildren;}
			set 
			{
				if(_alreadyFetchedChildren && !value && (_children != null))
				{
					_children.Clear();
				}
				_alreadyFetchedChildren = value;
			}
		}

		/// <summary> Retrieves all related entities of type 'LibraryEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiLibraryCollectionViaPolicyDocument()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.LibraryCollection LibraryCollectionViaPolicyDocument
		{
			get { return GetMultiLibraryCollectionViaPolicyDocument(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for LibraryCollectionViaPolicyDocument. When set to true, LibraryCollectionViaPolicyDocument is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time LibraryCollectionViaPolicyDocument is accessed. You can always execute
		/// a forced fetch by calling GetMultiLibraryCollectionViaPolicyDocument(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchLibraryCollectionViaPolicyDocument
		{
			get	{ return _alwaysFetchLibraryCollectionViaPolicyDocument; }
			set	{ _alwaysFetchLibraryCollectionViaPolicyDocument = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property LibraryCollectionViaPolicyDocument already has been fetched. Setting this property to false when LibraryCollectionViaPolicyDocument has been fetched
		/// will clear the LibraryCollectionViaPolicyDocument collection well. Setting this property to true while LibraryCollectionViaPolicyDocument hasn't been fetched disables lazy loading for LibraryCollectionViaPolicyDocument</summary>
		[Browsable(false)]
		public bool AlreadyFetchedLibraryCollectionViaPolicyDocument
		{
			get { return _alreadyFetchedLibraryCollectionViaPolicyDocument;}
			set 
			{
				if(_alreadyFetchedLibraryCollectionViaPolicyDocument && !value && (_libraryCollectionViaPolicyDocument != null))
				{
					_libraryCollectionViaPolicyDocument.Clear();
				}
				_alreadyFetchedLibraryCollectionViaPolicyDocument = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'PolicyEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiPolicyCollectionViaPolicyLink()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.PolicyCollection PolicyCollectionViaPolicyLink
		{
			get { return GetMultiPolicyCollectionViaPolicyLink(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for PolicyCollectionViaPolicyLink. When set to true, PolicyCollectionViaPolicyLink is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time PolicyCollectionViaPolicyLink is accessed. You can always execute
		/// a forced fetch by calling GetMultiPolicyCollectionViaPolicyLink(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchPolicyCollectionViaPolicyLink
		{
			get	{ return _alwaysFetchPolicyCollectionViaPolicyLink; }
			set	{ _alwaysFetchPolicyCollectionViaPolicyLink = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property PolicyCollectionViaPolicyLink already has been fetched. Setting this property to false when PolicyCollectionViaPolicyLink has been fetched
		/// will clear the PolicyCollectionViaPolicyLink collection well. Setting this property to true while PolicyCollectionViaPolicyLink hasn't been fetched disables lazy loading for PolicyCollectionViaPolicyLink</summary>
		[Browsable(false)]
		public bool AlreadyFetchedPolicyCollectionViaPolicyLink
		{
			get { return _alreadyFetchedPolicyCollectionViaPolicyLink;}
			set 
			{
				if(_alreadyFetchedPolicyCollectionViaPolicyLink && !value && (_policyCollectionViaPolicyLink != null))
				{
					_policyCollectionViaPolicyLink.Clear();
				}
				_alreadyFetchedPolicyCollectionViaPolicyLink = value;
			}
		}

		/// <summary> Gets / sets related entity of type 'PolicyEntity'. This property is not visible in databound grids.
		/// Setting this property to a new object will make the load-on-demand feature to stop fetching data from the database, until you set this
		/// property to null. Setting this property to an entity will make sure that FK-PK relations are synchronized when appropriate.</summary>
		/// <remarks>This property is added for conveniance, however it is recommeded to use the method 'GetSinglePolicy()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the
		/// same scope. The property is marked non-browsable to make it hidden in bound controls, f.e. datagrids.</remarks>
		[Browsable(false)]
		public virtual PolicyEntity Policy
		{
			get	{ return GetSinglePolicy(false); }
			set
			{
				if(base.IsDeserializing)
				{
					SetupSyncPolicy(value);
				}
				else
				{
					if(value==null)
					{
						if(_policy != null)
						{
							_policy.UnsetRelatedEntity(this, "PolicyLink");
						}
					}
					else
					{
						if(_policy!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "PolicyLink");
						}
					}
				}
			}
		}

		/// <summary> Gets / sets the lazy loading flag for Policy. When set to true, Policy is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Policy is accessed. You can always execute
		/// a forced fetch by calling GetSinglePolicy(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchPolicy
		{
			get	{ return _alwaysFetchPolicy; }
			set	{ _alwaysFetchPolicy = value; }	
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property Policy already has been fetched. Setting this property to false when Policy has been fetched
		/// will set Policy to null as well. Setting this property to true while Policy hasn't been fetched disables lazy loading for Policy</summary>
		[Browsable(false)]
		public bool AlreadyFetchedPolicy
		{
			get { return _alreadyFetchedPolicy;}
			set 
			{
				if(_alreadyFetchedPolicy && !value)
				{
					this.Policy = null;
				}
				_alreadyFetchedPolicy = value;
			}
		}

		/// <summary> Gets / sets the flag for what to do if the related entity available through the property Policy is not found
		/// in the database. When set to true, Policy will return a new entity instance if the related entity is not found, otherwise 
		/// null be returned if the related entity is not found. Default: true.</summary>
		[Browsable(false)]
		public bool PolicyReturnsNewIfNotFound
		{
			get	{ return _policyReturnsNewIfNotFound; }
			set { _policyReturnsNewIfNotFound = value; }	
		}
		/// <summary> Gets / sets related entity of type 'PolicyLinkEntity'. This property is not visible in databound grids.
		/// Setting this property to a new object will make the load-on-demand feature to stop fetching data from the database, until you set this
		/// property to null. Setting this property to an entity will make sure that FK-PK relations are synchronized when appropriate.</summary>
		/// <remarks>This property is added for conveniance, however it is recommeded to use the method 'GetSingleParent()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the
		/// same scope. The property is marked non-browsable to make it hidden in bound controls, f.e. datagrids.</remarks>
		[Browsable(false)]
		public virtual PolicyLinkEntity Parent
		{
			get	{ return GetSingleParent(false); }
			set
			{
				if(base.IsDeserializing)
				{
					SetupSyncParent(value);
				}
				else
				{
					if(value==null)
					{
						if(_parent != null)
						{
							_parent.UnsetRelatedEntity(this, "Children");
						}
					}
					else
					{
						if(_parent!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "Children");
						}
					}
				}
			}
		}

		/// <summary> Gets / sets the lazy loading flag for Parent. When set to true, Parent is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Parent is accessed. You can always execute
		/// a forced fetch by calling GetSingleParent(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchParent
		{
			get	{ return _alwaysFetchParent; }
			set	{ _alwaysFetchParent = value; }	
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property Parent already has been fetched. Setting this property to false when Parent has been fetched
		/// will set Parent to null as well. Setting this property to true while Parent hasn't been fetched disables lazy loading for Parent</summary>
		[Browsable(false)]
		public bool AlreadyFetchedParent
		{
			get { return _alreadyFetchedParent;}
			set 
			{
				if(_alreadyFetchedParent && !value)
				{
					this.Parent = null;
				}
				_alreadyFetchedParent = value;
			}
		}

		/// <summary> Gets / sets the flag for what to do if the related entity available through the property Parent is not found
		/// in the database. When set to true, Parent will return a new entity instance if the related entity is not found, otherwise 
		/// null be returned if the related entity is not found. Default: true.</summary>
		[Browsable(false)]
		public bool ParentReturnsNewIfNotFound
		{
			get	{ return _parentReturnsNewIfNotFound; }
			set { _parentReturnsNewIfNotFound = value; }	
		}



		/// <summary> Gets or sets a value indicating whether this entity is a subtype</summary>
		protected override bool LLBLGenProIsSubType
		{
			get { return false;}
		}

		/// <summary> Gets the type of the hierarchy this entity is in. </summary>
		[System.ComponentModel.Browsable(false), XmlIgnore]
		protected override InheritanceHierarchyType LLBLGenProIsInHierarchyOfType
		{
			get { return InheritanceHierarchyType.None;}
		}
		
		/// <summary>Returns the policyDB.EntityType enum value for this entity.</summary>
		[Browsable(false), XmlIgnore]
		public override int LLBLGenProEntityTypeValue 
		{ 
			get { return (int)policyDB.EntityType.PolicyLinkEntity; }
		}
		#endregion


		#region Custom Entity code
		
		// __LLBLGENPRO_USER_CODE_REGION_START CustomEntityCode
		// __LLBLGENPRO_USER_CODE_REGION_END
		#endregion

		#region Included code

		#endregion
	}
}
