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
using System.Collections.Generic;
using policyDB.HelperClasses;

using policyDB.EntityClasses;
using policyDB.RelationClasses;
using policyDB.DaoClasses;
using policyDB.CollectionClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.FactoryClasses
{
	
	// __LLBLGENPRO_USER_CODE_REGION_START AdditionalNamespaces
	// __LLBLGENPRO_USER_CODE_REGION_END
	
	/// <summary>general base class for the generated factories</summary>
	[Serializable]
	public partial class EntityFactoryBase : EntityFactoryCore
	{
		private string _entityName;
		private policyDB.EntityType _typeOfEntity;
		
		/// <summary>CTor</summary>
		/// <param name="entityName">Name of the entity.</param>
		/// <param name="typeOfEntity">The type of entity.</param>
		public EntityFactoryBase(string entityName, policyDB.EntityType typeOfEntity)
		{
			_entityName = entityName;
			_typeOfEntity = typeOfEntity;
		}

		/// <summary>Creates a new entity instance using the GeneralEntityFactory in the generated code, using the passed in entitytype value</summary>
		/// <param name="entityTypeValue">The entity type value of the entity to create an instance for.</param>
		/// <returns>new IEntity instance</returns>
		public override IEntity CreateEntityFromEntityTypeValue(int entityTypeValue)
		{
			return GeneralEntityFactory.Create((policyDB.EntityType)entityTypeValue);
		}
		
		/// <summary>Creates, using the generated EntityFieldsFactory, the IEntityFields object for the entity to create. </summary>
		/// <returns>Empty IEntityFields object.</returns>
		public override IEntityFields CreateFields()
		{
			return EntityFieldsFactory.CreateEntityFieldsObject(_typeOfEntity);
		}

		/// <summary>Creates the relations collection to the entity to join all targets so this entity can be fetched. </summary>
		/// <param name="objectAlias">The object alias to use for the elements in the relations.</param>
		/// <returns>null if the entity isn't in a hierarchy of type TargetPerEntity, otherwise the relations collection needed to join all targets together to fetch all subtypes of this entity and this entity itself</returns>
		public override IRelationCollection CreateHierarchyRelations(string objectAlias) 
		{
			return InheritanceInfoProviderSingleton.GetInstance().GetHierarchyRelations(_entityName, objectAlias);
		}

		/// <summary>This method retrieves, using the InheritanceInfoprovider, the factory for the entity represented by the values passed in.</summary>
		/// <param name="fieldValues">Field values read from the db, to determine which factory to return, based on the field values passed in.</param>
		/// <param name="entityFieldStartIndexesPerEntity">indexes into values where per entity type their own fields start.</param>
		/// <returns>the factory for the entity which is represented by the values passed in.</returns>
		public override IEntityFactory GetEntityFactory(object[] fieldValues, Dictionary<string, int> entityFieldStartIndexesPerEntity)
		{
			IEntityFactory toReturn = (IEntityFactory)InheritanceInfoProviderSingleton.GetInstance().GetEntityFactory(_entityName, fieldValues, entityFieldStartIndexesPerEntity);
			if(toReturn == null)
			{
				toReturn = this;
			}
			return toReturn;
		}
						
		/// <summary>Creates a new entity collection for the entity of this factory.</summary>
		/// <returns>ready to use new entity collection, typed.</returns>
		public override IEntityCollection CreateEntityCollection()
		{
			return GeneralEntityCollectionFactory.Create(_typeOfEntity);
		}
		
		/// <summary>returns the name of the entity this factory is for, e.g. "EmployeeEntity"</summary>
		public override string ForEntityName 
		{ 
			get { return _entityName; }
		}
	}
	
	/// <summary>Factory to create new, empty AttributeEntity objects.</summary>
	[Serializable]
	public partial class AttributeEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public AttributeEntityFactory() : base("AttributeEntity", policyDB.EntityType.AttributeEntity) { }

		/// <summary>Creates a new, empty AttributeEntity object.</summary>
		/// <returns>A new, empty AttributeEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new AttributeEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewAttribute
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new AttributeEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewAttributeUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty AttributeTypeEntity objects.</summary>
	[Serializable]
	public partial class AttributeTypeEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public AttributeTypeEntityFactory() : base("AttributeTypeEntity", policyDB.EntityType.AttributeTypeEntity) { }

		/// <summary>Creates a new, empty AttributeTypeEntity object.</summary>
		/// <returns>A new, empty AttributeTypeEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new AttributeTypeEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewAttributeType
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new AttributeTypeEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewAttributeTypeUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty AttributeValueEntity objects.</summary>
	[Serializable]
	public partial class AttributeValueEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public AttributeValueEntityFactory() : base("AttributeValueEntity", policyDB.EntityType.AttributeValueEntity) { }

		/// <summary>Creates a new, empty AttributeValueEntity object.</summary>
		/// <returns>A new, empty AttributeValueEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new AttributeValueEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewAttributeValue
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new AttributeValueEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewAttributeValueUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty CombineModeEntity objects.</summary>
	[Serializable]
	public partial class CombineModeEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public CombineModeEntityFactory() : base("CombineModeEntity", policyDB.EntityType.CombineModeEntity) { }

		/// <summary>Creates a new, empty CombineModeEntity object.</summary>
		/// <returns>A new, empty CombineModeEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new CombineModeEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewCombineMode
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new CombineModeEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewCombineModeUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty ContextEntity objects.</summary>
	[Serializable]
	public partial class ContextEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public ContextEntityFactory() : base("ContextEntity", policyDB.EntityType.ContextEntity) { }

		/// <summary>Creates a new, empty ContextEntity object.</summary>
		/// <returns>A new, empty ContextEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new ContextEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewContext
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new ContextEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewContextUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty DecisionNodeEntity objects.</summary>
	[Serializable]
	public partial class DecisionNodeEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public DecisionNodeEntityFactory() : base("DecisionNodeEntity", policyDB.EntityType.DecisionNodeEntity) { }

		/// <summary>Creates a new, empty DecisionNodeEntity object.</summary>
		/// <returns>A new, empty DecisionNodeEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new DecisionNodeEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewDecisionNode
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new DecisionNodeEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewDecisionNodeUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty EffectEntity objects.</summary>
	[Serializable]
	public partial class EffectEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public EffectEntityFactory() : base("EffectEntity", policyDB.EntityType.EffectEntity) { }

		/// <summary>Creates a new, empty EffectEntity object.</summary>
		/// <returns>A new, empty EffectEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new EffectEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewEffect
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new EffectEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewEffectUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty LibraryEntity objects.</summary>
	[Serializable]
	public partial class LibraryEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public LibraryEntityFactory() : base("LibraryEntity", policyDB.EntityType.LibraryEntity) { }

		/// <summary>Creates a new, empty LibraryEntity object.</summary>
		/// <returns>A new, empty LibraryEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new LibraryEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewLibrary
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new LibraryEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewLibraryUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty PolicyEntity objects.</summary>
	[Serializable]
	public partial class PolicyEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public PolicyEntityFactory() : base("PolicyEntity", policyDB.EntityType.PolicyEntity) { }

		/// <summary>Creates a new, empty PolicyEntity object.</summary>
		/// <returns>A new, empty PolicyEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new PolicyEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewPolicy
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new PolicyEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewPolicyUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty PolicyDocumentEntity objects.</summary>
	[Serializable]
	public partial class PolicyDocumentEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public PolicyDocumentEntityFactory() : base("PolicyDocumentEntity", policyDB.EntityType.PolicyDocumentEntity) { }

		/// <summary>Creates a new, empty PolicyDocumentEntity object.</summary>
		/// <returns>A new, empty PolicyDocumentEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new PolicyDocumentEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewPolicyDocument
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new PolicyDocumentEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewPolicyDocumentUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty PolicyLinkEntity objects.</summary>
	[Serializable]
	public partial class PolicyLinkEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public PolicyLinkEntityFactory() : base("PolicyLinkEntity", policyDB.EntityType.PolicyLinkEntity) { }

		/// <summary>Creates a new, empty PolicyLinkEntity object.</summary>
		/// <returns>A new, empty PolicyLinkEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new PolicyLinkEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewPolicyLink
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new PolicyLinkEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewPolicyLinkUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty QueryEntity objects.</summary>
	[Serializable]
	public partial class QueryEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public QueryEntityFactory() : base("QueryEntity", policyDB.EntityType.QueryEntity) { }

		/// <summary>Creates a new, empty QueryEntity object.</summary>
		/// <returns>A new, empty QueryEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new QueryEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewQuery
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new QueryEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewQueryUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty QueryValueEntity objects.</summary>
	[Serializable]
	public partial class QueryValueEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public QueryValueEntityFactory() : base("QueryValueEntity", policyDB.EntityType.QueryValueEntity) { }

		/// <summary>Creates a new, empty QueryValueEntity object.</summary>
		/// <returns>A new, empty QueryValueEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new QueryValueEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewQueryValue
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new QueryValueEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewQueryValueUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty RuleEntity objects.</summary>
	[Serializable]
	public partial class RuleEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public RuleEntityFactory() : base("RuleEntity", policyDB.EntityType.RuleEntity) { }

		/// <summary>Creates a new, empty RuleEntity object.</summary>
		/// <returns>A new, empty RuleEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new RuleEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewRule
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new RuleEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewRuleUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty TargetEntity objects.</summary>
	[Serializable]
	public partial class TargetEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public TargetEntityFactory() : base("TargetEntity", policyDB.EntityType.TargetEntity) { }

		/// <summary>Creates a new, empty TargetEntity object.</summary>
		/// <returns>A new, empty TargetEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new TargetEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewTarget
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new TargetEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewTargetUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty TargetConditionEntity objects.</summary>
	[Serializable]
	public partial class TargetConditionEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public TargetConditionEntityFactory() : base("TargetConditionEntity", policyDB.EntityType.TargetConditionEntity) { }

		/// <summary>Creates a new, empty TargetConditionEntity object.</summary>
		/// <returns>A new, empty TargetConditionEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new TargetConditionEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewTargetCondition
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new TargetConditionEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewTargetConditionUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}
	
	/// <summary>Factory to create new, empty UriComponentEntity objects.</summary>
	[Serializable]
	public partial class UriComponentEntityFactory : EntityFactoryBase {
		/// <summary>CTor</summary>
		public UriComponentEntityFactory() : base("UriComponentEntity", policyDB.EntityType.UriComponentEntity) { }

		/// <summary>Creates a new, empty UriComponentEntity object.</summary>
		/// <returns>A new, empty UriComponentEntity object.</returns>
		public override IEntity Create() {
			IEntity toReturn = new UriComponentEntity();
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewUriComponent
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}
		
		/// <summary>Creates a new UriComponentEntity instance and will set the Fields object of the new IEntity instance to the passed in fields object.</summary>
		/// <param name="fields">Populated IEntityFields object for the new IEntity to create</param>
		/// <returns>Fully created and populated (due to the IEntityFields object) IEntity object</returns>
		public override IEntity Create(IEntityFields fields) {
			IEntity toReturn = Create();
			toReturn.Fields = fields;
			
			// __LLBLGENPRO_USER_CODE_REGION_START CreateNewUriComponentUsingFields
			// __LLBLGENPRO_USER_CODE_REGION_END
			return toReturn;
		}

		#region Included Code

		#endregion
	}

	/// <summary>Factory to create new entity collection objects</summary>
	[Serializable]
	public partial class GeneralEntityCollectionFactory
	{
		/// <summary>Creates a new entity collection</summary>
		/// <param name="typeToUse">The entity type to create the collection for.</param>
		/// <returns>A new entity collection object.</returns>
		public static IEntityCollection Create(policyDB.EntityType typeToUse)
		{
			switch(typeToUse)
			{
				case policyDB.EntityType.AttributeEntity:
					return new AttributeCollection();
				case policyDB.EntityType.AttributeTypeEntity:
					return new AttributeTypeCollection();
				case policyDB.EntityType.AttributeValueEntity:
					return new AttributeValueCollection();
				case policyDB.EntityType.CombineModeEntity:
					return new CombineModeCollection();
				case policyDB.EntityType.ContextEntity:
					return new ContextCollection();
				case policyDB.EntityType.DecisionNodeEntity:
					return new DecisionNodeCollection();
				case policyDB.EntityType.EffectEntity:
					return new EffectCollection();
				case policyDB.EntityType.LibraryEntity:
					return new LibraryCollection();
				case policyDB.EntityType.PolicyEntity:
					return new PolicyCollection();
				case policyDB.EntityType.PolicyDocumentEntity:
					return new PolicyDocumentCollection();
				case policyDB.EntityType.PolicyLinkEntity:
					return new PolicyLinkCollection();
				case policyDB.EntityType.QueryEntity:
					return new QueryCollection();
				case policyDB.EntityType.QueryValueEntity:
					return new QueryValueCollection();
				case policyDB.EntityType.RuleEntity:
					return new RuleCollection();
				case policyDB.EntityType.TargetEntity:
					return new TargetCollection();
				case policyDB.EntityType.TargetConditionEntity:
					return new TargetConditionCollection();
				case policyDB.EntityType.UriComponentEntity:
					return new UriComponentCollection();
				default:
					return null;
			}
		}		
	}
	
	/// <summary>Factory to create new, empty Entity objects based on the entity type specified. Uses entity specific factory objects</summary>
	[Serializable]
	public partial class GeneralEntityFactory
	{
		/// <summary>Creates a new, empty Entity object of the type specified</summary>
		/// <param name="entityTypeToCreate">The entity type to create.</param>
		/// <returns>A new, empty Entity object.</returns>
		public static IEntity Create(policyDB.EntityType entityTypeToCreate)
		{
			IEntityFactory factoryToUse = null;
			switch(entityTypeToCreate)
			{
				case policyDB.EntityType.AttributeEntity:
					factoryToUse = new AttributeEntityFactory();
					break;
				case policyDB.EntityType.AttributeTypeEntity:
					factoryToUse = new AttributeTypeEntityFactory();
					break;
				case policyDB.EntityType.AttributeValueEntity:
					factoryToUse = new AttributeValueEntityFactory();
					break;
				case policyDB.EntityType.CombineModeEntity:
					factoryToUse = new CombineModeEntityFactory();
					break;
				case policyDB.EntityType.ContextEntity:
					factoryToUse = new ContextEntityFactory();
					break;
				case policyDB.EntityType.DecisionNodeEntity:
					factoryToUse = new DecisionNodeEntityFactory();
					break;
				case policyDB.EntityType.EffectEntity:
					factoryToUse = new EffectEntityFactory();
					break;
				case policyDB.EntityType.LibraryEntity:
					factoryToUse = new LibraryEntityFactory();
					break;
				case policyDB.EntityType.PolicyEntity:
					factoryToUse = new PolicyEntityFactory();
					break;
				case policyDB.EntityType.PolicyDocumentEntity:
					factoryToUse = new PolicyDocumentEntityFactory();
					break;
				case policyDB.EntityType.PolicyLinkEntity:
					factoryToUse = new PolicyLinkEntityFactory();
					break;
				case policyDB.EntityType.QueryEntity:
					factoryToUse = new QueryEntityFactory();
					break;
				case policyDB.EntityType.QueryValueEntity:
					factoryToUse = new QueryValueEntityFactory();
					break;
				case policyDB.EntityType.RuleEntity:
					factoryToUse = new RuleEntityFactory();
					break;
				case policyDB.EntityType.TargetEntity:
					factoryToUse = new TargetEntityFactory();
					break;
				case policyDB.EntityType.TargetConditionEntity:
					factoryToUse = new TargetConditionEntityFactory();
					break;
				case policyDB.EntityType.UriComponentEntity:
					factoryToUse = new UriComponentEntityFactory();
					break;
			}
			IEntity toReturn = null;
			if(factoryToUse != null)
			{
				toReturn = factoryToUse.Create();
			}
			return toReturn;
		}		
	}
	
	/// <summary>Class which is used to obtain the entity factory based on the .NET type of the entity. </summary>
	[Serializable]
	public static class EntityFactoryFactory
	{
#if CF
		/// <summary>Gets the factory of the entity with the policyDB.EntityType specified</summary>
		/// <param name="typeOfEntity">The type of entity.</param>
		/// <returns>factory to use or null if not found</returns>
		public static IEntityFactory GetFactory(policyDB.EntityType typeOfEntity)
		{
			return GeneralEntityFactory.Create(typeOfEntity).GetEntityFactory();
		}
#else
		private static Dictionary<Type, IEntityFactory> _factoryPerType = new Dictionary<Type, IEntityFactory>();

		/// <summary>Initializes the <see cref="EntityFactoryFactory"/> class.</summary>
		static EntityFactoryFactory()
		{
			Array entityTypeValues = Enum.GetValues(typeof(policyDB.EntityType));
			foreach(int entityTypeValue in entityTypeValues)
			{
				IEntity dummy = GeneralEntityFactory.Create((policyDB.EntityType)entityTypeValue);
				_factoryPerType.Add(dummy.GetType(), dummy.GetEntityFactory());
			}
		}

		/// <summary>Gets the factory of the entity with the .NET type specified</summary>
		/// <param name="typeOfEntity">The type of entity.</param>
		/// <returns>factory to use or null if not found</returns>
		public static IEntityFactory GetFactory(Type typeOfEntity)
		{
			IEntityFactory toReturn = null;
			_factoryPerType.TryGetValue(typeOfEntity, out toReturn);
			return toReturn;
		}

		/// <summary>Gets the factory of the entity with the policyDB.EntityType specified</summary>
		/// <param name="typeOfEntity">The type of entity.</param>
		/// <returns>factory to use or null if not found</returns>
		public static IEntityFactory GetFactory(policyDB.EntityType typeOfEntity)
		{
			return GetFactory(GeneralEntityFactory.Create(typeOfEntity).GetType());
		}
#endif
	}
	
	/// <summary>Element creator for creating project elements from somewhere else, like inside Linq providers.</summary>
	public class ElementCreator : ElementCreatorBase, IElementCreator
	{
		/// <summary>Gets the factory of the Entity type with the policyDB.EntityType value passed in</summary>
		/// <param name="entityTypeValue">The entity type value.</param>
		/// <returns>the entity factory of the entity type or null if not found</returns>
		public IEntityFactory GetFactory(int entityTypeValue)
		{
			return (IEntityFactory)this.GetFactoryImpl(entityTypeValue);
		}

		/// <summary>Gets the factory of the Entity type with the .NET type passed in</summary>
		/// <param name="typeOfEntity">The type of entity.</param>
		/// <returns>the entity factory of the entity type or null if not found</returns>
		public IEntityFactory GetFactory(Type typeOfEntity)
		{
			return (IEntityFactory)this.GetFactoryImpl(typeOfEntity);
		}

		/// <summary>Creates a new resultset fields object with the number of field slots reserved as specified</summary>
		/// <param name="numberOfFields">The number of fields.</param>
		/// <returns>ready to use resultsetfields object</returns>
		public IEntityFields CreateResultsetFields(int numberOfFields)
		{
			return new ResultsetFields(numberOfFields);
		}
		
		/// <summary>Gets an instance of the TypedListDAO class to execute dynamic lists and projections.</summary>
		/// <returns>ready to use typedlistDAO</returns>
		public IDao GetTypedListDao()
		{
			return new TypedListDAO();
		}
		
		/// <summary>Creates a new dynamic relation instance</summary>
		/// <param name="leftOperand">The left operand.</param>
		/// <returns>ready to use dynamic relation</returns>
		public override IDynamicRelation CreateDynamicRelation(DerivedTableDefinition leftOperand)
		{
			return new DynamicRelation(leftOperand);
		}

		/// <summary>Creates a new dynamic relation instance</summary>
		/// <param name="leftOperand">The left operand.</param>
		/// <param name="joinType">Type of the join. If None is specified, Inner is assumed.</param>
		/// <param name="rightOperand">The right operand.</param>
		/// <param name="onClause">The on clause for the join.</param>
		/// <returns>ready to use dynamic relation</returns>
		public override IDynamicRelation CreateDynamicRelation(DerivedTableDefinition leftOperand, JoinHint joinType, DerivedTableDefinition rightOperand, IPredicate onClause)
		{
			return new DynamicRelation(leftOperand, joinType, rightOperand, onClause);
		}

		/// <summary>Creates a new dynamic relation instance</summary>
		/// <param name="leftOperand">The left operand.</param>
		/// <param name="joinType">Type of the join. If None is specified, Inner is assumed.</param>
		/// <param name="rightOperandEntityName">Name of the entity, which is used as the right operand.</param>
		/// <param name="aliasRightOperand">The alias of the right operand. If you don't want to / need to alias the right operand (only alias if you have to), specify string.Empty.</param>
		/// <param name="onClause">The on clause for the join.</param>
		/// <returns>ready to use dynamic relation</returns>
		public override IDynamicRelation CreateDynamicRelation(DerivedTableDefinition leftOperand, JoinHint joinType, string rightOperandEntityName, string aliasRightOperand, IPredicate onClause)
		{
			return new DynamicRelation(leftOperand, joinType, (policyDB.EntityType)Enum.Parse(typeof(policyDB.EntityType), rightOperandEntityName, false), aliasRightOperand, onClause);
		}

		/// <summary>Creates a new dynamic relation instance</summary>
		/// <param name="leftOperandEntityName">Name of the entity which is used as the left operand.</param>
		/// <param name="joinType">Type of the join. If None is specified, Inner is assumed.</param>
		/// <param name="rightOperandEntityName">Name of the entity, which is used as the right operand.</param>
		/// <param name="aliasLeftOperand">The alias of the left operand. If you don't want to / need to alias the right operand (only alias if you have to), specify string.Empty.</param>
		/// <param name="aliasRightOperand">The alias of the right operand. If you don't want to / need to alias the right operand (only alias if you have to), specify string.Empty.</param>
		/// <param name="onClause">The on clause for the join.</param>
		/// <returns>ready to use dynamic relation</returns>
		public override IDynamicRelation CreateDynamicRelation(string leftOperandEntityName, JoinHint joinType, string rightOperandEntityName, string aliasLeftOperand, string aliasRightOperand, IPredicate onClause)
		{
			return new DynamicRelation((policyDB.EntityType)Enum.Parse(typeof(policyDB.EntityType), leftOperandEntityName, false), joinType, (policyDB.EntityType)Enum.Parse(typeof(policyDB.EntityType), rightOperandEntityName, false), aliasLeftOperand, aliasRightOperand, onClause);
		}
				
		/// <summary>Obtains the inheritance info provider instance from the singleton </summary>
		/// <returns>The singleton instance of the inheritance info provider</returns>
		public override IInheritanceInfoProvider ObtainInheritanceInfoProviderInstance()
		{
			return InheritanceInfoProviderSingleton.GetInstance();
		}

		/// <summary>Implementation of the routine which gets the factory of the Entity type with the policyDB.EntityType value passed in</summary>
		/// <param name="entityTypeValue">The entity type value.</param>
		/// <returns>the entity factory of the entity type or null if not found</returns>
		protected override IEntityFactoryCore GetFactoryImpl(int entityTypeValue)
		{
			return EntityFactoryFactory.GetFactory((policyDB.EntityType)entityTypeValue);
		}
#if !CF		
		/// <summary>Implementation of the routine which gets the factory of the Entity type with the .NET type passed in</summary>
		/// <param name="typeOfEntity">The type of entity.</param>
		/// <returns>the entity factory of the entity type or null if not found</returns>
		protected override IEntityFactoryCore GetFactoryImpl(Type typeOfEntity)
		{
			return EntityFactoryFactory.GetFactory(typeOfEntity);
		}
#endif
	}
}
