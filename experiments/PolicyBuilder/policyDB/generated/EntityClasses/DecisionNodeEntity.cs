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
	/// Entity class which represents the entity 'DecisionNode'. <br/><br/>
	/// 
	/// </summary>
	[Serializable]
	public partial class DecisionNodeEntity : CommonEntityBase, ISerializable
		// __LLBLGENPRO_USER_CODE_REGION_START AdditionalInterfaces
		// __LLBLGENPRO_USER_CODE_REGION_END	
	{
		#region Class Member Declarations
		private policyDB.CollectionClasses.AttributeValueCollection	_attributeValue;
		private bool	_alwaysFetchAttributeValue, _alreadyFetchedAttributeValue;
		private policyDB.CollectionClasses.DecisionNodeCollection	_children;
		private bool	_alwaysFetchChildren, _alreadyFetchedChildren;
		private policyDB.CollectionClasses.RuleCollection	_rule;
		private bool	_alwaysFetchRule, _alreadyFetchedRule;
		private policyDB.CollectionClasses.TargetConditionCollection	_targetCondition;
		private bool	_alwaysFetchTargetCondition, _alreadyFetchedTargetCondition;
		private policyDB.CollectionClasses.AttributeCollection _attributeCollectionViaDecisionNode;
		private bool	_alwaysFetchAttributeCollectionViaDecisionNode, _alreadyFetchedAttributeCollectionViaDecisionNode;
		private policyDB.CollectionClasses.AttributeCollection _attributeCollectionViaAttributeValue;
		private bool	_alwaysFetchAttributeCollectionViaAttributeValue, _alreadyFetchedAttributeCollectionViaAttributeValue;
		private policyDB.CollectionClasses.EffectCollection _effectCollectionViaRule;
		private bool	_alwaysFetchEffectCollectionViaRule, _alreadyFetchedEffectCollectionViaRule;
		private policyDB.CollectionClasses.PolicyCollection _policyCollectionViaRule;
		private bool	_alwaysFetchPolicyCollectionViaRule, _alreadyFetchedPolicyCollectionViaRule;
		private policyDB.CollectionClasses.TargetCollection _targetCollectionViaTargetCondition;
		private bool	_alwaysFetchTargetCollectionViaTargetCondition, _alreadyFetchedTargetCollectionViaTargetCondition;
		private AttributeEntity _attribute;
		private bool	_alwaysFetchAttribute, _alreadyFetchedAttribute, _attributeReturnsNewIfNotFound;
		private DecisionNodeEntity _parent;
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
			/// <summary>Member name Attribute</summary>
			public static readonly string Attribute = "Attribute";
			/// <summary>Member name Parent</summary>
			public static readonly string Parent = "Parent";
			/// <summary>Member name AttributeValue</summary>
			public static readonly string AttributeValue = "AttributeValue";
			/// <summary>Member name Children</summary>
			public static readonly string Children = "Children";
			/// <summary>Member name Rule</summary>
			public static readonly string Rule = "Rule";
			/// <summary>Member name TargetCondition</summary>
			public static readonly string TargetCondition = "TargetCondition";
			/// <summary>Member name AttributeCollectionViaDecisionNode</summary>
			public static readonly string AttributeCollectionViaDecisionNode = "AttributeCollectionViaDecisionNode";
			/// <summary>Member name AttributeCollectionViaAttributeValue</summary>
			public static readonly string AttributeCollectionViaAttributeValue = "AttributeCollectionViaAttributeValue";
			/// <summary>Member name EffectCollectionViaRule</summary>
			public static readonly string EffectCollectionViaRule = "EffectCollectionViaRule";
			/// <summary>Member name PolicyCollectionViaRule</summary>
			public static readonly string PolicyCollectionViaRule = "PolicyCollectionViaRule";
			/// <summary>Member name TargetCollectionViaTargetCondition</summary>
			public static readonly string TargetCollectionViaTargetCondition = "TargetCollectionViaTargetCondition";

		}
		#endregion
		
		/// <summary>Static CTor for setting up custom property hashtables. Is executed before the first instance of this entity class or derived classes is constructed. </summary>
		static DecisionNodeEntity()
		{
			SetupCustomPropertyHashtables();
		}

		/// <summary>CTor</summary>
		public DecisionNodeEntity()
		{
			InitClassEmpty(null);
		}


		/// <summary>CTor</summary>
		/// <param name="id">PK value for DecisionNode which data should be fetched into this DecisionNode object</param>
		public DecisionNodeEntity(System.Int32 id)
		{
			InitClassFetch(id, null, null);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for DecisionNode which data should be fetched into this DecisionNode object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		public DecisionNodeEntity(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			InitClassFetch(id, null, prefetchPathToUse);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for DecisionNode which data should be fetched into this DecisionNode object</param>
		/// <param name="validator">The custom validator object for this DecisionNodeEntity</param>
		public DecisionNodeEntity(System.Int32 id, IValidator validator)
		{
			InitClassFetch(id, validator, null);
		}


		/// <summary>Private CTor for deserialization</summary>
		/// <param name="info"></param>
		/// <param name="context"></param>
		protected DecisionNodeEntity(SerializationInfo info, StreamingContext context) : base(info, context)
		{
			_attributeValue = (policyDB.CollectionClasses.AttributeValueCollection)info.GetValue("_attributeValue", typeof(policyDB.CollectionClasses.AttributeValueCollection));
			_alwaysFetchAttributeValue = info.GetBoolean("_alwaysFetchAttributeValue");
			_alreadyFetchedAttributeValue = info.GetBoolean("_alreadyFetchedAttributeValue");
			_children = (policyDB.CollectionClasses.DecisionNodeCollection)info.GetValue("_children", typeof(policyDB.CollectionClasses.DecisionNodeCollection));
			_alwaysFetchChildren = info.GetBoolean("_alwaysFetchChildren");
			_alreadyFetchedChildren = info.GetBoolean("_alreadyFetchedChildren");
			_rule = (policyDB.CollectionClasses.RuleCollection)info.GetValue("_rule", typeof(policyDB.CollectionClasses.RuleCollection));
			_alwaysFetchRule = info.GetBoolean("_alwaysFetchRule");
			_alreadyFetchedRule = info.GetBoolean("_alreadyFetchedRule");
			_targetCondition = (policyDB.CollectionClasses.TargetConditionCollection)info.GetValue("_targetCondition", typeof(policyDB.CollectionClasses.TargetConditionCollection));
			_alwaysFetchTargetCondition = info.GetBoolean("_alwaysFetchTargetCondition");
			_alreadyFetchedTargetCondition = info.GetBoolean("_alreadyFetchedTargetCondition");
			_attributeCollectionViaDecisionNode = (policyDB.CollectionClasses.AttributeCollection)info.GetValue("_attributeCollectionViaDecisionNode", typeof(policyDB.CollectionClasses.AttributeCollection));
			_alwaysFetchAttributeCollectionViaDecisionNode = info.GetBoolean("_alwaysFetchAttributeCollectionViaDecisionNode");
			_alreadyFetchedAttributeCollectionViaDecisionNode = info.GetBoolean("_alreadyFetchedAttributeCollectionViaDecisionNode");
			_attributeCollectionViaAttributeValue = (policyDB.CollectionClasses.AttributeCollection)info.GetValue("_attributeCollectionViaAttributeValue", typeof(policyDB.CollectionClasses.AttributeCollection));
			_alwaysFetchAttributeCollectionViaAttributeValue = info.GetBoolean("_alwaysFetchAttributeCollectionViaAttributeValue");
			_alreadyFetchedAttributeCollectionViaAttributeValue = info.GetBoolean("_alreadyFetchedAttributeCollectionViaAttributeValue");
			_effectCollectionViaRule = (policyDB.CollectionClasses.EffectCollection)info.GetValue("_effectCollectionViaRule", typeof(policyDB.CollectionClasses.EffectCollection));
			_alwaysFetchEffectCollectionViaRule = info.GetBoolean("_alwaysFetchEffectCollectionViaRule");
			_alreadyFetchedEffectCollectionViaRule = info.GetBoolean("_alreadyFetchedEffectCollectionViaRule");
			_policyCollectionViaRule = (policyDB.CollectionClasses.PolicyCollection)info.GetValue("_policyCollectionViaRule", typeof(policyDB.CollectionClasses.PolicyCollection));
			_alwaysFetchPolicyCollectionViaRule = info.GetBoolean("_alwaysFetchPolicyCollectionViaRule");
			_alreadyFetchedPolicyCollectionViaRule = info.GetBoolean("_alreadyFetchedPolicyCollectionViaRule");
			_targetCollectionViaTargetCondition = (policyDB.CollectionClasses.TargetCollection)info.GetValue("_targetCollectionViaTargetCondition", typeof(policyDB.CollectionClasses.TargetCollection));
			_alwaysFetchTargetCollectionViaTargetCondition = info.GetBoolean("_alwaysFetchTargetCollectionViaTargetCondition");
			_alreadyFetchedTargetCollectionViaTargetCondition = info.GetBoolean("_alreadyFetchedTargetCollectionViaTargetCondition");
			_attribute = (AttributeEntity)info.GetValue("_attribute", typeof(AttributeEntity));
			if(_attribute!=null)
			{
				_attribute.AfterSave+=new EventHandler(OnEntityAfterSave);
			}
			_attributeReturnsNewIfNotFound = info.GetBoolean("_attributeReturnsNewIfNotFound");
			_alwaysFetchAttribute = info.GetBoolean("_alwaysFetchAttribute");
			_alreadyFetchedAttribute = info.GetBoolean("_alreadyFetchedAttribute");
			_parent = (DecisionNodeEntity)info.GetValue("_parent", typeof(DecisionNodeEntity));
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
			switch((DecisionNodeFieldIndex)fieldIndex)
			{
				case DecisionNodeFieldIndex.ParentId:
					DesetupSyncParent(true, false);
					_alreadyFetchedParent = false;
					break;
				case DecisionNodeFieldIndex.AttributeId:
					DesetupSyncAttribute(true, false);
					_alreadyFetchedAttribute = false;
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
			_alreadyFetchedAttributeValue = (_attributeValue.Count > 0);
			_alreadyFetchedChildren = (_children.Count > 0);
			_alreadyFetchedRule = (_rule.Count > 0);
			_alreadyFetchedTargetCondition = (_targetCondition.Count > 0);
			_alreadyFetchedAttributeCollectionViaDecisionNode = (_attributeCollectionViaDecisionNode.Count > 0);
			_alreadyFetchedAttributeCollectionViaAttributeValue = (_attributeCollectionViaAttributeValue.Count > 0);
			_alreadyFetchedEffectCollectionViaRule = (_effectCollectionViaRule.Count > 0);
			_alreadyFetchedPolicyCollectionViaRule = (_policyCollectionViaRule.Count > 0);
			_alreadyFetchedTargetCollectionViaTargetCondition = (_targetCollectionViaTargetCondition.Count > 0);
			_alreadyFetchedAttribute = (_attribute != null);
			_alreadyFetchedParent = (_parent != null);

		}
				
		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public override RelationCollection GetRelationsForFieldOfType(string fieldName)
		{
			return DecisionNodeEntity.GetRelationsForField(fieldName);
		}

		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public static RelationCollection GetRelationsForField(string fieldName)
		{
			RelationCollection toReturn = new RelationCollection();
			switch(fieldName)
			{
				case "Attribute":
					toReturn.Add(DecisionNodeEntity.Relations.AttributeEntityUsingAttributeId);
					break;
				case "Parent":
					toReturn.Add(DecisionNodeEntity.Relations.DecisionNodeEntityUsingIdParentId);
					break;
				case "AttributeValue":
					toReturn.Add(DecisionNodeEntity.Relations.AttributeValueEntityUsingAttributeMatchId);
					break;
				case "Children":
					toReturn.Add(DecisionNodeEntity.Relations.DecisionNodeEntityUsingParentId);
					break;
				case "Rule":
					toReturn.Add(DecisionNodeEntity.Relations.RuleEntityUsingConditionId);
					break;
				case "TargetCondition":
					toReturn.Add(DecisionNodeEntity.Relations.TargetConditionEntityUsingConditionId);
					break;
				case "AttributeCollectionViaDecisionNode":
					toReturn.Add(DecisionNodeEntity.Relations.DecisionNodeEntityUsingParentId, "DecisionNodeEntity__", "DecisionNode_", JoinHint.None);
					toReturn.Add(DecisionNodeEntity.Relations.AttributeEntityUsingAttributeId, "DecisionNode_", string.Empty, JoinHint.None);
					break;
				case "AttributeCollectionViaAttributeValue":
					toReturn.Add(DecisionNodeEntity.Relations.AttributeValueEntityUsingAttributeMatchId, "DecisionNodeEntity__", "AttributeValue_", JoinHint.None);
					toReturn.Add(AttributeValueEntity.Relations.AttributeEntityUsingAttributeId, "AttributeValue_", string.Empty, JoinHint.None);
					break;
				case "EffectCollectionViaRule":
					toReturn.Add(DecisionNodeEntity.Relations.RuleEntityUsingConditionId, "DecisionNodeEntity__", "Rule_", JoinHint.None);
					toReturn.Add(RuleEntity.Relations.EffectEntityUsingEffectId, "Rule_", string.Empty, JoinHint.None);
					break;
				case "PolicyCollectionViaRule":
					toReturn.Add(DecisionNodeEntity.Relations.RuleEntityUsingConditionId, "DecisionNodeEntity__", "Rule_", JoinHint.None);
					toReturn.Add(RuleEntity.Relations.PolicyEntityUsingPolicyId, "Rule_", string.Empty, JoinHint.None);
					break;
				case "TargetCollectionViaTargetCondition":
					toReturn.Add(DecisionNodeEntity.Relations.TargetConditionEntityUsingConditionId, "DecisionNodeEntity__", "TargetCondition_", JoinHint.None);
					toReturn.Add(TargetConditionEntity.Relations.TargetEntityUsingTargetId, "TargetCondition_", string.Empty, JoinHint.None);
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
			info.AddValue("_attributeValue", (!this.MarkedForDeletion?_attributeValue:null));
			info.AddValue("_alwaysFetchAttributeValue", _alwaysFetchAttributeValue);
			info.AddValue("_alreadyFetchedAttributeValue", _alreadyFetchedAttributeValue);
			info.AddValue("_children", (!this.MarkedForDeletion?_children:null));
			info.AddValue("_alwaysFetchChildren", _alwaysFetchChildren);
			info.AddValue("_alreadyFetchedChildren", _alreadyFetchedChildren);
			info.AddValue("_rule", (!this.MarkedForDeletion?_rule:null));
			info.AddValue("_alwaysFetchRule", _alwaysFetchRule);
			info.AddValue("_alreadyFetchedRule", _alreadyFetchedRule);
			info.AddValue("_targetCondition", (!this.MarkedForDeletion?_targetCondition:null));
			info.AddValue("_alwaysFetchTargetCondition", _alwaysFetchTargetCondition);
			info.AddValue("_alreadyFetchedTargetCondition", _alreadyFetchedTargetCondition);
			info.AddValue("_attributeCollectionViaDecisionNode", (!this.MarkedForDeletion?_attributeCollectionViaDecisionNode:null));
			info.AddValue("_alwaysFetchAttributeCollectionViaDecisionNode", _alwaysFetchAttributeCollectionViaDecisionNode);
			info.AddValue("_alreadyFetchedAttributeCollectionViaDecisionNode", _alreadyFetchedAttributeCollectionViaDecisionNode);
			info.AddValue("_attributeCollectionViaAttributeValue", (!this.MarkedForDeletion?_attributeCollectionViaAttributeValue:null));
			info.AddValue("_alwaysFetchAttributeCollectionViaAttributeValue", _alwaysFetchAttributeCollectionViaAttributeValue);
			info.AddValue("_alreadyFetchedAttributeCollectionViaAttributeValue", _alreadyFetchedAttributeCollectionViaAttributeValue);
			info.AddValue("_effectCollectionViaRule", (!this.MarkedForDeletion?_effectCollectionViaRule:null));
			info.AddValue("_alwaysFetchEffectCollectionViaRule", _alwaysFetchEffectCollectionViaRule);
			info.AddValue("_alreadyFetchedEffectCollectionViaRule", _alreadyFetchedEffectCollectionViaRule);
			info.AddValue("_policyCollectionViaRule", (!this.MarkedForDeletion?_policyCollectionViaRule:null));
			info.AddValue("_alwaysFetchPolicyCollectionViaRule", _alwaysFetchPolicyCollectionViaRule);
			info.AddValue("_alreadyFetchedPolicyCollectionViaRule", _alreadyFetchedPolicyCollectionViaRule);
			info.AddValue("_targetCollectionViaTargetCondition", (!this.MarkedForDeletion?_targetCollectionViaTargetCondition:null));
			info.AddValue("_alwaysFetchTargetCollectionViaTargetCondition", _alwaysFetchTargetCollectionViaTargetCondition);
			info.AddValue("_alreadyFetchedTargetCollectionViaTargetCondition", _alreadyFetchedTargetCollectionViaTargetCondition);
			info.AddValue("_attribute", (!this.MarkedForDeletion?_attribute:null));
			info.AddValue("_attributeReturnsNewIfNotFound", _attributeReturnsNewIfNotFound);
			info.AddValue("_alwaysFetchAttribute", _alwaysFetchAttribute);
			info.AddValue("_alreadyFetchedAttribute", _alreadyFetchedAttribute);
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
				case "Attribute":
					_alreadyFetchedAttribute = true;
					this.Attribute = (AttributeEntity)entity;
					break;
				case "Parent":
					_alreadyFetchedParent = true;
					this.Parent = (DecisionNodeEntity)entity;
					break;
				case "AttributeValue":
					_alreadyFetchedAttributeValue = true;
					if(entity!=null)
					{
						this.AttributeValue.Add((AttributeValueEntity)entity);
					}
					break;
				case "Children":
					_alreadyFetchedChildren = true;
					if(entity!=null)
					{
						this.Children.Add((DecisionNodeEntity)entity);
					}
					break;
				case "Rule":
					_alreadyFetchedRule = true;
					if(entity!=null)
					{
						this.Rule.Add((RuleEntity)entity);
					}
					break;
				case "TargetCondition":
					_alreadyFetchedTargetCondition = true;
					if(entity!=null)
					{
						this.TargetCondition.Add((TargetConditionEntity)entity);
					}
					break;
				case "AttributeCollectionViaDecisionNode":
					_alreadyFetchedAttributeCollectionViaDecisionNode = true;
					if(entity!=null)
					{
						this.AttributeCollectionViaDecisionNode.Add((AttributeEntity)entity);
					}
					break;
				case "AttributeCollectionViaAttributeValue":
					_alreadyFetchedAttributeCollectionViaAttributeValue = true;
					if(entity!=null)
					{
						this.AttributeCollectionViaAttributeValue.Add((AttributeEntity)entity);
					}
					break;
				case "EffectCollectionViaRule":
					_alreadyFetchedEffectCollectionViaRule = true;
					if(entity!=null)
					{
						this.EffectCollectionViaRule.Add((EffectEntity)entity);
					}
					break;
				case "PolicyCollectionViaRule":
					_alreadyFetchedPolicyCollectionViaRule = true;
					if(entity!=null)
					{
						this.PolicyCollectionViaRule.Add((PolicyEntity)entity);
					}
					break;
				case "TargetCollectionViaTargetCondition":
					_alreadyFetchedTargetCollectionViaTargetCondition = true;
					if(entity!=null)
					{
						this.TargetCollectionViaTargetCondition.Add((TargetEntity)entity);
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
				case "Attribute":
					SetupSyncAttribute(relatedEntity);
					break;
				case "Parent":
					SetupSyncParent(relatedEntity);
					break;
				case "AttributeValue":
					_attributeValue.Add((AttributeValueEntity)relatedEntity);
					break;
				case "Children":
					_children.Add((DecisionNodeEntity)relatedEntity);
					break;
				case "Rule":
					_rule.Add((RuleEntity)relatedEntity);
					break;
				case "TargetCondition":
					_targetCondition.Add((TargetConditionEntity)relatedEntity);
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
				case "Attribute":
					DesetupSyncAttribute(false, true);
					break;
				case "Parent":
					DesetupSyncParent(false, true);
					break;
				case "AttributeValue":
					base.PerformRelatedEntityRemoval(_attributeValue, relatedEntity, signalRelatedEntityManyToOne);
					break;
				case "Children":
					base.PerformRelatedEntityRemoval(_children, relatedEntity, signalRelatedEntityManyToOne);
					break;
				case "Rule":
					base.PerformRelatedEntityRemoval(_rule, relatedEntity, signalRelatedEntityManyToOne);
					break;
				case "TargetCondition":
					base.PerformRelatedEntityRemoval(_targetCondition, relatedEntity, signalRelatedEntityManyToOne);
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
			if(_attribute!=null)
			{
				toReturn.Add(_attribute);
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
			toReturn.Add(_attributeValue);
			toReturn.Add(_children);
			toReturn.Add(_rule);
			toReturn.Add(_targetCondition);

			return toReturn;
		}

		

		

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for DecisionNode which data should be fetched into this DecisionNode object</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id)
		{
			return FetchUsingPK(id, null, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for DecisionNode which data should be fetched into this DecisionNode object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			return FetchUsingPK(id, prefetchPathToUse, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for DecisionNode which data should be fetched into this DecisionNode object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse, Context contextToUse)
		{
			return Fetch(id, prefetchPathToUse, contextToUse, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for DecisionNode which data should be fetched into this DecisionNode object</param>
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
		public bool TestOriginalFieldValueForNull(DecisionNodeFieldIndex fieldIndex)
		{
			return base.Fields[(int)fieldIndex].IsNull;
		}
		
		/// <summary>Returns true if the current value for the field with the fieldIndex passed in represents null/not defined, false otherwise.
		/// Should not be used for testing if the original value (read from the db) is NULL</summary>
		/// <param name="fieldIndex">Index of the field to test if its currentvalue is null/undefined</param>
		/// <returns>true if the field's value isn't defined yet, false otherwise</returns>
		public bool TestCurrentFieldValueForNull(DecisionNodeFieldIndex fieldIndex)
		{
			return base.CheckIfCurrentFieldValueIsNull((int)fieldIndex);
		}

				
		/// <summary>Gets a list of all the EntityRelation objects the type of this instance has.</summary>
		/// <returns>A list of all the EntityRelation objects the type of this instance has. Hierarchy relations are excluded.</returns>
		public override List<IEntityRelation> GetAllRelations()
		{
			return new DecisionNodeRelations().GetAllRelations();
		}


		/// <summary> Retrieves all related entities of type 'AttributeValueEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'AttributeValueEntity'</returns>
		public policyDB.CollectionClasses.AttributeValueCollection GetMultiAttributeValue(bool forceFetch)
		{
			return GetMultiAttributeValue(forceFetch, _attributeValue.EntityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'AttributeValueEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of type 'AttributeValueEntity'</returns>
		public policyDB.CollectionClasses.AttributeValueCollection GetMultiAttributeValue(bool forceFetch, IPredicateExpression filter)
		{
			return GetMultiAttributeValue(forceFetch, _attributeValue.EntityFactoryToUse, filter);
		}

		/// <summary> Retrieves all related entities of type 'AttributeValueEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.AttributeValueCollection GetMultiAttributeValue(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
			return GetMultiAttributeValue(forceFetch, entityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'AttributeValueEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public virtual policyDB.CollectionClasses.AttributeValueCollection GetMultiAttributeValue(bool forceFetch, IEntityFactory entityFactoryToUse, IPredicateExpression filter)
		{
 			if( ( !_alreadyFetchedAttributeValue || forceFetch || _alwaysFetchAttributeValue) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_attributeValue.ParticipatesInTransaction)
					{
						base.Transaction.Add(_attributeValue);
					}
				}
				_attributeValue.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_attributeValue.EntityFactoryToUse = entityFactoryToUse;
				}
				_attributeValue.GetMultiManyToOne(null, this, filter);
				_attributeValue.SuppressClearInGetMulti=false;
				_alreadyFetchedAttributeValue = true;
			}
			return _attributeValue;
		}

		/// <summary> Sets the collection parameters for the collection for 'AttributeValue'. These settings will be taken into account
		/// when the property AttributeValue is requested or GetMultiAttributeValue is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersAttributeValue(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_attributeValue.SortClauses=sortClauses;
			_attributeValue.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'DecisionNodeEntity'</returns>
		public policyDB.CollectionClasses.DecisionNodeCollection GetMultiChildren(bool forceFetch)
		{
			return GetMultiChildren(forceFetch, _children.EntityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of type 'DecisionNodeEntity'</returns>
		public policyDB.CollectionClasses.DecisionNodeCollection GetMultiChildren(bool forceFetch, IPredicateExpression filter)
		{
			return GetMultiChildren(forceFetch, _children.EntityFactoryToUse, filter);
		}

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.DecisionNodeCollection GetMultiChildren(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
			return GetMultiChildren(forceFetch, entityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public virtual policyDB.CollectionClasses.DecisionNodeCollection GetMultiChildren(bool forceFetch, IEntityFactory entityFactoryToUse, IPredicateExpression filter)
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

		/// <summary> Retrieves all related entities of type 'RuleEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'RuleEntity'</returns>
		public policyDB.CollectionClasses.RuleCollection GetMultiRule(bool forceFetch)
		{
			return GetMultiRule(forceFetch, _rule.EntityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'RuleEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of type 'RuleEntity'</returns>
		public policyDB.CollectionClasses.RuleCollection GetMultiRule(bool forceFetch, IPredicateExpression filter)
		{
			return GetMultiRule(forceFetch, _rule.EntityFactoryToUse, filter);
		}

		/// <summary> Retrieves all related entities of type 'RuleEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.RuleCollection GetMultiRule(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
			return GetMultiRule(forceFetch, entityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'RuleEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public virtual policyDB.CollectionClasses.RuleCollection GetMultiRule(bool forceFetch, IEntityFactory entityFactoryToUse, IPredicateExpression filter)
		{
 			if( ( !_alreadyFetchedRule || forceFetch || _alwaysFetchRule) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_rule.ParticipatesInTransaction)
					{
						base.Transaction.Add(_rule);
					}
				}
				_rule.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_rule.EntityFactoryToUse = entityFactoryToUse;
				}
				_rule.GetMultiManyToOne(this, null, null, filter);
				_rule.SuppressClearInGetMulti=false;
				_alreadyFetchedRule = true;
			}
			return _rule;
		}

		/// <summary> Sets the collection parameters for the collection for 'Rule'. These settings will be taken into account
		/// when the property Rule is requested or GetMultiRule is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersRule(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_rule.SortClauses=sortClauses;
			_rule.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'TargetConditionEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'TargetConditionEntity'</returns>
		public policyDB.CollectionClasses.TargetConditionCollection GetMultiTargetCondition(bool forceFetch)
		{
			return GetMultiTargetCondition(forceFetch, _targetCondition.EntityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'TargetConditionEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of type 'TargetConditionEntity'</returns>
		public policyDB.CollectionClasses.TargetConditionCollection GetMultiTargetCondition(bool forceFetch, IPredicateExpression filter)
		{
			return GetMultiTargetCondition(forceFetch, _targetCondition.EntityFactoryToUse, filter);
		}

		/// <summary> Retrieves all related entities of type 'TargetConditionEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.TargetConditionCollection GetMultiTargetCondition(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
			return GetMultiTargetCondition(forceFetch, entityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'TargetConditionEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public virtual policyDB.CollectionClasses.TargetConditionCollection GetMultiTargetCondition(bool forceFetch, IEntityFactory entityFactoryToUse, IPredicateExpression filter)
		{
 			if( ( !_alreadyFetchedTargetCondition || forceFetch || _alwaysFetchTargetCondition) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_targetCondition.ParticipatesInTransaction)
					{
						base.Transaction.Add(_targetCondition);
					}
				}
				_targetCondition.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_targetCondition.EntityFactoryToUse = entityFactoryToUse;
				}
				_targetCondition.GetMultiManyToOne(this, null, filter);
				_targetCondition.SuppressClearInGetMulti=false;
				_alreadyFetchedTargetCondition = true;
			}
			return _targetCondition;
		}

		/// <summary> Sets the collection parameters for the collection for 'TargetCondition'. These settings will be taken into account
		/// when the property TargetCondition is requested or GetMultiTargetCondition is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersTargetCondition(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_targetCondition.SortClauses=sortClauses;
			_targetCondition.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'AttributeEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'AttributeEntity'</returns>
		public policyDB.CollectionClasses.AttributeCollection GetMultiAttributeCollectionViaDecisionNode(bool forceFetch)
		{
			return GetMultiAttributeCollectionViaDecisionNode(forceFetch, _attributeCollectionViaDecisionNode.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'AttributeEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.AttributeCollection GetMultiAttributeCollectionViaDecisionNode(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedAttributeCollectionViaDecisionNode || forceFetch || _alwaysFetchAttributeCollectionViaDecisionNode) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_attributeCollectionViaDecisionNode.ParticipatesInTransaction)
					{
						base.Transaction.Add(_attributeCollectionViaDecisionNode);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(DecisionNodeFields.Id, ComparisonOperator.Equal, this.Id, "DecisionNodeEntity__"));
				_attributeCollectionViaDecisionNode.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_attributeCollectionViaDecisionNode.EntityFactoryToUse = entityFactoryToUse;
				}
				_attributeCollectionViaDecisionNode.GetMulti(filter, GetRelationsForField("AttributeCollectionViaDecisionNode"));
				_attributeCollectionViaDecisionNode.SuppressClearInGetMulti=false;
				_alreadyFetchedAttributeCollectionViaDecisionNode = true;
			}
			return _attributeCollectionViaDecisionNode;
		}

		/// <summary> Sets the collection parameters for the collection for 'AttributeCollectionViaDecisionNode'. These settings will be taken into account
		/// when the property AttributeCollectionViaDecisionNode is requested or GetMultiAttributeCollectionViaDecisionNode is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersAttributeCollectionViaDecisionNode(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_attributeCollectionViaDecisionNode.SortClauses=sortClauses;
			_attributeCollectionViaDecisionNode.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'AttributeEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'AttributeEntity'</returns>
		public policyDB.CollectionClasses.AttributeCollection GetMultiAttributeCollectionViaAttributeValue(bool forceFetch)
		{
			return GetMultiAttributeCollectionViaAttributeValue(forceFetch, _attributeCollectionViaAttributeValue.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'AttributeEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.AttributeCollection GetMultiAttributeCollectionViaAttributeValue(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedAttributeCollectionViaAttributeValue || forceFetch || _alwaysFetchAttributeCollectionViaAttributeValue) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_attributeCollectionViaAttributeValue.ParticipatesInTransaction)
					{
						base.Transaction.Add(_attributeCollectionViaAttributeValue);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(DecisionNodeFields.Id, ComparisonOperator.Equal, this.Id, "DecisionNodeEntity__"));
				_attributeCollectionViaAttributeValue.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_attributeCollectionViaAttributeValue.EntityFactoryToUse = entityFactoryToUse;
				}
				_attributeCollectionViaAttributeValue.GetMulti(filter, GetRelationsForField("AttributeCollectionViaAttributeValue"));
				_attributeCollectionViaAttributeValue.SuppressClearInGetMulti=false;
				_alreadyFetchedAttributeCollectionViaAttributeValue = true;
			}
			return _attributeCollectionViaAttributeValue;
		}

		/// <summary> Sets the collection parameters for the collection for 'AttributeCollectionViaAttributeValue'. These settings will be taken into account
		/// when the property AttributeCollectionViaAttributeValue is requested or GetMultiAttributeCollectionViaAttributeValue is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersAttributeCollectionViaAttributeValue(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_attributeCollectionViaAttributeValue.SortClauses=sortClauses;
			_attributeCollectionViaAttributeValue.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'EffectEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'EffectEntity'</returns>
		public policyDB.CollectionClasses.EffectCollection GetMultiEffectCollectionViaRule(bool forceFetch)
		{
			return GetMultiEffectCollectionViaRule(forceFetch, _effectCollectionViaRule.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'EffectEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.EffectCollection GetMultiEffectCollectionViaRule(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedEffectCollectionViaRule || forceFetch || _alwaysFetchEffectCollectionViaRule) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_effectCollectionViaRule.ParticipatesInTransaction)
					{
						base.Transaction.Add(_effectCollectionViaRule);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(DecisionNodeFields.Id, ComparisonOperator.Equal, this.Id, "DecisionNodeEntity__"));
				_effectCollectionViaRule.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_effectCollectionViaRule.EntityFactoryToUse = entityFactoryToUse;
				}
				_effectCollectionViaRule.GetMulti(filter, GetRelationsForField("EffectCollectionViaRule"));
				_effectCollectionViaRule.SuppressClearInGetMulti=false;
				_alreadyFetchedEffectCollectionViaRule = true;
			}
			return _effectCollectionViaRule;
		}

		/// <summary> Sets the collection parameters for the collection for 'EffectCollectionViaRule'. These settings will be taken into account
		/// when the property EffectCollectionViaRule is requested or GetMultiEffectCollectionViaRule is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersEffectCollectionViaRule(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_effectCollectionViaRule.SortClauses=sortClauses;
			_effectCollectionViaRule.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'PolicyEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'PolicyEntity'</returns>
		public policyDB.CollectionClasses.PolicyCollection GetMultiPolicyCollectionViaRule(bool forceFetch)
		{
			return GetMultiPolicyCollectionViaRule(forceFetch, _policyCollectionViaRule.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'PolicyEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.PolicyCollection GetMultiPolicyCollectionViaRule(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedPolicyCollectionViaRule || forceFetch || _alwaysFetchPolicyCollectionViaRule) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_policyCollectionViaRule.ParticipatesInTransaction)
					{
						base.Transaction.Add(_policyCollectionViaRule);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(DecisionNodeFields.Id, ComparisonOperator.Equal, this.Id, "DecisionNodeEntity__"));
				_policyCollectionViaRule.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_policyCollectionViaRule.EntityFactoryToUse = entityFactoryToUse;
				}
				_policyCollectionViaRule.GetMulti(filter, GetRelationsForField("PolicyCollectionViaRule"));
				_policyCollectionViaRule.SuppressClearInGetMulti=false;
				_alreadyFetchedPolicyCollectionViaRule = true;
			}
			return _policyCollectionViaRule;
		}

		/// <summary> Sets the collection parameters for the collection for 'PolicyCollectionViaRule'. These settings will be taken into account
		/// when the property PolicyCollectionViaRule is requested or GetMultiPolicyCollectionViaRule is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersPolicyCollectionViaRule(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_policyCollectionViaRule.SortClauses=sortClauses;
			_policyCollectionViaRule.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'TargetEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'TargetEntity'</returns>
		public policyDB.CollectionClasses.TargetCollection GetMultiTargetCollectionViaTargetCondition(bool forceFetch)
		{
			return GetMultiTargetCollectionViaTargetCondition(forceFetch, _targetCollectionViaTargetCondition.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'TargetEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.TargetCollection GetMultiTargetCollectionViaTargetCondition(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedTargetCollectionViaTargetCondition || forceFetch || _alwaysFetchTargetCollectionViaTargetCondition) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_targetCollectionViaTargetCondition.ParticipatesInTransaction)
					{
						base.Transaction.Add(_targetCollectionViaTargetCondition);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(DecisionNodeFields.Id, ComparisonOperator.Equal, this.Id, "DecisionNodeEntity__"));
				_targetCollectionViaTargetCondition.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_targetCollectionViaTargetCondition.EntityFactoryToUse = entityFactoryToUse;
				}
				_targetCollectionViaTargetCondition.GetMulti(filter, GetRelationsForField("TargetCollectionViaTargetCondition"));
				_targetCollectionViaTargetCondition.SuppressClearInGetMulti=false;
				_alreadyFetchedTargetCollectionViaTargetCondition = true;
			}
			return _targetCollectionViaTargetCondition;
		}

		/// <summary> Sets the collection parameters for the collection for 'TargetCollectionViaTargetCondition'. These settings will be taken into account
		/// when the property TargetCollectionViaTargetCondition is requested or GetMultiTargetCollectionViaTargetCondition is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersTargetCollectionViaTargetCondition(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_targetCollectionViaTargetCondition.SortClauses=sortClauses;
			_targetCollectionViaTargetCondition.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves the related entity of type 'AttributeEntity', using a relation of type 'n:1'</summary>
		/// <returns>A fetched entity of type 'AttributeEntity' which is related to this entity.</returns>
		public AttributeEntity GetSingleAttribute()
		{
			return GetSingleAttribute(false);
		}

		/// <summary> Retrieves the related entity of type 'AttributeEntity', using a relation of type 'n:1'</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the currently loaded related entity and will refetch the entity from the persistent storage</param>
		/// <returns>A fetched entity of type 'AttributeEntity' which is related to this entity.</returns>
		public virtual AttributeEntity GetSingleAttribute(bool forceFetch)
		{
			if( ( !_alreadyFetchedAttribute || forceFetch || _alwaysFetchAttribute) && !base.IsSerializing && !base.IsDeserializing  && !base.InDesignMode)			
			{
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(DecisionNodeEntity.Relations.AttributeEntityUsingAttributeId);

				AttributeEntity newEntity = new AttributeEntity();
				if(base.ParticipatesInTransaction)
				{
					base.Transaction.Add(newEntity);
				}
				bool fetchResult = false;
				if(performLazyLoading)
				{
					fetchResult = newEntity.FetchUsingPK(this.AttributeId.GetValueOrDefault());
				}
				if(fetchResult)
				{
					if(base.ActiveContext!=null)
					{
						newEntity = (AttributeEntity)base.ActiveContext.Get(newEntity);
					}
					this.Attribute = newEntity;
				}
				else
				{
					if(_attributeReturnsNewIfNotFound)
					{
						if(performLazyLoading || (!performLazyLoading && (_attribute == null)))
						{
							this.Attribute = newEntity;
						}
					}
					else
					{
						this.Attribute = null;
					}
				}
				_alreadyFetchedAttribute = fetchResult;
				if(base.ParticipatesInTransaction && !fetchResult)
				{
					base.Transaction.Remove(newEntity);
				}
			}
			return _attribute;
		}

		/// <summary> Retrieves the related entity of type 'DecisionNodeEntity', using a relation of type 'n:1'</summary>
		/// <returns>A fetched entity of type 'DecisionNodeEntity' which is related to this entity.</returns>
		public DecisionNodeEntity GetSingleParent()
		{
			return GetSingleParent(false);
		}

		/// <summary> Retrieves the related entity of type 'DecisionNodeEntity', using a relation of type 'n:1'</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the currently loaded related entity and will refetch the entity from the persistent storage</param>
		/// <returns>A fetched entity of type 'DecisionNodeEntity' which is related to this entity.</returns>
		public virtual DecisionNodeEntity GetSingleParent(bool forceFetch)
		{
			if( ( !_alreadyFetchedParent || forceFetch || _alwaysFetchParent) && !base.IsSerializing && !base.IsDeserializing  && !base.InDesignMode)			
			{
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(DecisionNodeEntity.Relations.DecisionNodeEntityUsingIdParentId);

				DecisionNodeEntity newEntity = new DecisionNodeEntity();
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
						newEntity = (DecisionNodeEntity)base.ActiveContext.Get(newEntity);
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
			DecisionNodeDAO dao = (DecisionNodeDAO)CreateDAOInstance();
			return dao.AddNew(base.Fields, base.Transaction);
		}
		
		/// <summary> Adds the internals to the active context. </summary>
		protected override void AddInternalsToContext()
		{
			_attributeValue.ActiveContext = base.ActiveContext;
			_children.ActiveContext = base.ActiveContext;
			_rule.ActiveContext = base.ActiveContext;
			_targetCondition.ActiveContext = base.ActiveContext;
			_attributeCollectionViaDecisionNode.ActiveContext = base.ActiveContext;
			_attributeCollectionViaAttributeValue.ActiveContext = base.ActiveContext;
			_effectCollectionViaRule.ActiveContext = base.ActiveContext;
			_policyCollectionViaRule.ActiveContext = base.ActiveContext;
			_targetCollectionViaTargetCondition.ActiveContext = base.ActiveContext;
			if(_attribute!=null)
			{
				_attribute.ActiveContext = base.ActiveContext;
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
			DecisionNodeDAO dao = (DecisionNodeDAO)CreateDAOInstance();
			return dao.UpdateExisting(base.Fields, base.Transaction);
		}
		
		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <param name="updateRestriction">Predicate expression, meant for concurrency checks in an Update query</param>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity(IPredicate updateRestriction)
		{
			DecisionNodeDAO dao = (DecisionNodeDAO)CreateDAOInstance();
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
			return EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.DecisionNodeEntity);
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
			toReturn.Add("Attribute", _attribute);
			toReturn.Add("Parent", _parent);
			toReturn.Add("AttributeValue", _attributeValue);
			toReturn.Add("Children", _children);
			toReturn.Add("Rule", _rule);
			toReturn.Add("TargetCondition", _targetCondition);
			toReturn.Add("AttributeCollectionViaDecisionNode", _attributeCollectionViaDecisionNode);
			toReturn.Add("AttributeCollectionViaAttributeValue", _attributeCollectionViaAttributeValue);
			toReturn.Add("EffectCollectionViaRule", _effectCollectionViaRule);
			toReturn.Add("PolicyCollectionViaRule", _policyCollectionViaRule);
			toReturn.Add("TargetCollectionViaTargetCondition", _targetCollectionViaTargetCondition);

			return toReturn;
		}
		

		/// <summary> Initializes the the entity and fetches the data related to the entity in this entity.</summary>
		/// <param name="id">PK value for DecisionNode which data should be fetched into this DecisionNode object</param>
		/// <param name="validator">The validator object for this DecisionNodeEntity</param>
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
			_attributeValue = new policyDB.CollectionClasses.AttributeValueCollection(new AttributeValueEntityFactory());
			_attributeValue.SetContainingEntityInfo(this, "AttributeMatch");
			_alwaysFetchAttributeValue = false;
			_alreadyFetchedAttributeValue = false;
			_children = new policyDB.CollectionClasses.DecisionNodeCollection(new DecisionNodeEntityFactory());
			_children.SetContainingEntityInfo(this, "Parent");
			_alwaysFetchChildren = false;
			_alreadyFetchedChildren = false;
			_rule = new policyDB.CollectionClasses.RuleCollection(new RuleEntityFactory());
			_rule.SetContainingEntityInfo(this, "Condition");
			_alwaysFetchRule = false;
			_alreadyFetchedRule = false;
			_targetCondition = new policyDB.CollectionClasses.TargetConditionCollection(new TargetConditionEntityFactory());
			_targetCondition.SetContainingEntityInfo(this, "DecisionNode");
			_alwaysFetchTargetCondition = false;
			_alreadyFetchedTargetCondition = false;
			_attributeCollectionViaDecisionNode = new policyDB.CollectionClasses.AttributeCollection(new AttributeEntityFactory());
			_alwaysFetchAttributeCollectionViaDecisionNode = false;
			_alreadyFetchedAttributeCollectionViaDecisionNode = false;
			_attributeCollectionViaAttributeValue = new policyDB.CollectionClasses.AttributeCollection(new AttributeEntityFactory());
			_alwaysFetchAttributeCollectionViaAttributeValue = false;
			_alreadyFetchedAttributeCollectionViaAttributeValue = false;
			_effectCollectionViaRule = new policyDB.CollectionClasses.EffectCollection(new EffectEntityFactory());
			_alwaysFetchEffectCollectionViaRule = false;
			_alreadyFetchedEffectCollectionViaRule = false;
			_policyCollectionViaRule = new policyDB.CollectionClasses.PolicyCollection(new PolicyEntityFactory());
			_alwaysFetchPolicyCollectionViaRule = false;
			_alreadyFetchedPolicyCollectionViaRule = false;
			_targetCollectionViaTargetCondition = new policyDB.CollectionClasses.TargetCollection(new TargetEntityFactory());
			_alwaysFetchTargetCollectionViaTargetCondition = false;
			_alreadyFetchedTargetCollectionViaTargetCondition = false;
			_attribute = null;
			_attributeReturnsNewIfNotFound = true;
			_alwaysFetchAttribute = false;
			_alreadyFetchedAttribute = false;
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

			_fieldsCustomProperties.Add("ParentId", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("Type", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("CombineAnd", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("AttributeId", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("Extra", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("Order", fieldHashtable);
		}
		#endregion


		/// <summary> Removes the sync logic for member _attribute</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncAttribute(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _attribute, new PropertyChangedEventHandler( OnAttributePropertyChanged ), "Attribute", DecisionNodeEntity.Relations.AttributeEntityUsingAttributeId, true, signalRelatedEntity, "DecisionNode", resetFKFields, new int[] { (int)DecisionNodeFieldIndex.AttributeId } );		
			_attribute = null;
		}
		
		/// <summary> setups the sync logic for member _attribute</summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		private void SetupSyncAttribute(IEntity relatedEntity)
		{
			if(_attribute!=relatedEntity)
			{		
				DesetupSyncAttribute(true, true);
				_attribute = (AttributeEntity)relatedEntity;
				base.PerformSetupSyncRelatedEntity( _attribute, new PropertyChangedEventHandler( OnAttributePropertyChanged ), "Attribute", DecisionNodeEntity.Relations.AttributeEntityUsingAttributeId, true, ref _alreadyFetchedAttribute, new string[] {  } );
			}
		}

		/// <summary>Handles property change events of properties in a related entity.</summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void OnAttributePropertyChanged( object sender, PropertyChangedEventArgs e )
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
			base.PerformDesetupSyncRelatedEntity( _parent, new PropertyChangedEventHandler( OnParentPropertyChanged ), "Parent", DecisionNodeEntity.Relations.DecisionNodeEntityUsingIdParentId, true, signalRelatedEntity, "Children", resetFKFields, new int[] { (int)DecisionNodeFieldIndex.ParentId } );		
			_parent = null;
		}
		
		/// <summary> setups the sync logic for member _parent</summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		private void SetupSyncParent(IEntity relatedEntity)
		{
			if(_parent!=relatedEntity)
			{		
				DesetupSyncParent(true, true);
				_parent = (DecisionNodeEntity)relatedEntity;
				base.PerformSetupSyncRelatedEntity( _parent, new PropertyChangedEventHandler( OnParentPropertyChanged ), "Parent", DecisionNodeEntity.Relations.DecisionNodeEntityUsingIdParentId, true, ref _alreadyFetchedParent, new string[] {  } );
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
		/// <param name="id">PK value for DecisionNode which data should be fetched into this DecisionNode object</param>
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
				base.Fields[(int)DecisionNodeFieldIndex.Id].ForcedCurrentValueWrite(id);
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
			return DAOFactory.CreateDecisionNodeDAO();
		}
		
		/// <summary> Creates the entity factory for this type.</summary>
		/// <returns></returns>
		protected override IEntityFactory CreateEntityFactory()
		{
			return new DecisionNodeEntityFactory();
		}

		#region Class Property Declarations
		/// <summary> The relations object holding all relations of this entity with other entity classes.</summary>
		public  static DecisionNodeRelations Relations
		{
			get	{ return new DecisionNodeRelations(); }
		}
		
		/// <summary> The custom properties for this entity type.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		public  static Dictionary<string, string> CustomProperties
		{
			get { return _customProperties;}
		}


		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'AttributeValue' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathAttributeValue
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.AttributeValueCollection(),
					(IEntityRelation)GetRelationsForField("AttributeValue")[0], (int)policyDB.EntityType.DecisionNodeEntity, (int)policyDB.EntityType.AttributeValueEntity, 0, null, null, null, "AttributeValue", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'DecisionNode' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathChildren
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.DecisionNodeCollection(),
					(IEntityRelation)GetRelationsForField("Children")[0], (int)policyDB.EntityType.DecisionNodeEntity, (int)policyDB.EntityType.DecisionNodeEntity, 0, null, null, null, "Children", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Rule' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathRule
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.RuleCollection(),
					(IEntityRelation)GetRelationsForField("Rule")[0], (int)policyDB.EntityType.DecisionNodeEntity, (int)policyDB.EntityType.RuleEntity, 0, null, null, null, "Rule", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'TargetCondition' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathTargetCondition
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.TargetConditionCollection(),
					(IEntityRelation)GetRelationsForField("TargetCondition")[0], (int)policyDB.EntityType.DecisionNodeEntity, (int)policyDB.EntityType.TargetConditionEntity, 0, null, null, null, "TargetCondition", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Attribute' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathAttributeCollectionViaDecisionNode
		{
			get
			{
				IEntityRelation intermediateRelation = DecisionNodeEntity.Relations.DecisionNodeEntityUsingParentId;
				intermediateRelation.SetAliases(string.Empty, "DecisionNode_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.AttributeCollection(), intermediateRelation,
					(int)policyDB.EntityType.DecisionNodeEntity, (int)policyDB.EntityType.AttributeEntity, 0, null, null, GetRelationsForField("AttributeCollectionViaDecisionNode"), "AttributeCollectionViaDecisionNode", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Attribute' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathAttributeCollectionViaAttributeValue
		{
			get
			{
				IEntityRelation intermediateRelation = DecisionNodeEntity.Relations.AttributeValueEntityUsingAttributeMatchId;
				intermediateRelation.SetAliases(string.Empty, "AttributeValue_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.AttributeCollection(), intermediateRelation,
					(int)policyDB.EntityType.DecisionNodeEntity, (int)policyDB.EntityType.AttributeEntity, 0, null, null, GetRelationsForField("AttributeCollectionViaAttributeValue"), "AttributeCollectionViaAttributeValue", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Effect' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathEffectCollectionViaRule
		{
			get
			{
				IEntityRelation intermediateRelation = DecisionNodeEntity.Relations.RuleEntityUsingConditionId;
				intermediateRelation.SetAliases(string.Empty, "Rule_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.EffectCollection(), intermediateRelation,
					(int)policyDB.EntityType.DecisionNodeEntity, (int)policyDB.EntityType.EffectEntity, 0, null, null, GetRelationsForField("EffectCollectionViaRule"), "EffectCollectionViaRule", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Policy' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathPolicyCollectionViaRule
		{
			get
			{
				IEntityRelation intermediateRelation = DecisionNodeEntity.Relations.RuleEntityUsingConditionId;
				intermediateRelation.SetAliases(string.Empty, "Rule_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.PolicyCollection(), intermediateRelation,
					(int)policyDB.EntityType.DecisionNodeEntity, (int)policyDB.EntityType.PolicyEntity, 0, null, null, GetRelationsForField("PolicyCollectionViaRule"), "PolicyCollectionViaRule", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Target' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathTargetCollectionViaTargetCondition
		{
			get
			{
				IEntityRelation intermediateRelation = DecisionNodeEntity.Relations.TargetConditionEntityUsingConditionId;
				intermediateRelation.SetAliases(string.Empty, "TargetCondition_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.TargetCollection(), intermediateRelation,
					(int)policyDB.EntityType.DecisionNodeEntity, (int)policyDB.EntityType.TargetEntity, 0, null, null, GetRelationsForField("TargetCollectionViaTargetCondition"), "TargetCollectionViaTargetCondition", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Attribute' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathAttribute
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.AttributeCollection(),
					(IEntityRelation)GetRelationsForField("Attribute")[0], (int)policyDB.EntityType.DecisionNodeEntity, (int)policyDB.EntityType.AttributeEntity, 0, null, null, null, "Attribute", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'DecisionNode' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathParent
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.DecisionNodeCollection(),
					(IEntityRelation)GetRelationsForField("Parent")[0], (int)policyDB.EntityType.DecisionNodeEntity, (int)policyDB.EntityType.DecisionNodeEntity, 0, null, null, null, "Parent", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
			}
		}


		/// <summary>Returns the full name for this entity, which is important for the DAO to find back persistence info for this entity.</summary>
		[Browsable(false), XmlIgnore]
		public override string LLBLGenProEntityName
		{
			get { return "DecisionNodeEntity";}
		}

		/// <summary> The custom properties for the type of this entity instance.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		[Browsable(false), XmlIgnore]
		public override Dictionary<string, string> CustomPropertiesOfType
		{
			get { return DecisionNodeEntity.CustomProperties;}
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
			get { return DecisionNodeEntity.FieldsCustomProperties;}
		}

		/// <summary> The Id property of the Entity DecisionNode<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "decisionNode"."id"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, true, true</remarks>
		public virtual System.Int32 Id
		{
			get { return (System.Int32)GetValue((int)DecisionNodeFieldIndex.Id, true); }
			set	{ SetValue((int)DecisionNodeFieldIndex.Id, value, true); }
		}
		/// <summary> The ParentId property of the Entity DecisionNode<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "decisionNode"."parentId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): true, false, false</remarks>
		public virtual Nullable<System.Int32> ParentId
		{
			get { return (Nullable<System.Int32>)GetValue((int)DecisionNodeFieldIndex.ParentId, false); }
			set	{ SetValue((int)DecisionNodeFieldIndex.ParentId, value, true); }
		}
		/// <summary> The Type property of the Entity DecisionNode<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "decisionNode"."type"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Int32 Type
		{
			get { return (System.Int32)GetValue((int)DecisionNodeFieldIndex.Type, true); }
			set	{ SetValue((int)DecisionNodeFieldIndex.Type, value, true); }
		}
		/// <summary> The CombineAnd property of the Entity DecisionNode<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "decisionNode"."combineAnd"<br/>
		/// Table field type characteristics (type, precision, scale, length): Bit, 1, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Boolean CombineAnd
		{
			get { return (System.Boolean)GetValue((int)DecisionNodeFieldIndex.CombineAnd, true); }
			set	{ SetValue((int)DecisionNodeFieldIndex.CombineAnd, value, true); }
		}
		/// <summary> The AttributeId property of the Entity DecisionNode<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "decisionNode"."attributeId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): true, false, false</remarks>
		public virtual Nullable<System.Int32> AttributeId
		{
			get { return (Nullable<System.Int32>)GetValue((int)DecisionNodeFieldIndex.AttributeId, false); }
			set	{ SetValue((int)DecisionNodeFieldIndex.AttributeId, value, true); }
		}
		/// <summary> The Extra property of the Entity DecisionNode<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "decisionNode"."extra"<br/>
		/// Table field type characteristics (type, precision, scale, length): NVarChar, 0, 0, 250<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): true, false, false</remarks>
		public virtual System.String Extra
		{
			get { return (System.String)GetValue((int)DecisionNodeFieldIndex.Extra, true); }
			set	{ SetValue((int)DecisionNodeFieldIndex.Extra, value, true); }
		}
		/// <summary> The Order property of the Entity DecisionNode<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "decisionNode"."order"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Int32 Order
		{
			get { return (System.Int32)GetValue((int)DecisionNodeFieldIndex.Order, true); }
			set	{ SetValue((int)DecisionNodeFieldIndex.Order, value, true); }
		}

		/// <summary> Retrieves all related entities of type 'AttributeValueEntity' using a relation of type '1:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiAttributeValue()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.AttributeValueCollection AttributeValue
		{
			get	{ return GetMultiAttributeValue(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for AttributeValue. When set to true, AttributeValue is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time AttributeValue is accessed. You can always execute
		/// a forced fetch by calling GetMultiAttributeValue(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchAttributeValue
		{
			get	{ return _alwaysFetchAttributeValue; }
			set	{ _alwaysFetchAttributeValue = value; }	
		}		
				
		/// <summary>Gets / Sets the lazy loading flag if the property AttributeValue already has been fetched. Setting this property to false when AttributeValue has been fetched
		/// will clear the AttributeValue collection well. Setting this property to true while AttributeValue hasn't been fetched disables lazy loading for AttributeValue</summary>
		[Browsable(false)]
		public bool AlreadyFetchedAttributeValue
		{
			get { return _alreadyFetchedAttributeValue;}
			set 
			{
				if(_alreadyFetchedAttributeValue && !value && (_attributeValue != null))
				{
					_attributeValue.Clear();
				}
				_alreadyFetchedAttributeValue = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type '1:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiChildren()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.DecisionNodeCollection Children
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
		/// <summary> Retrieves all related entities of type 'RuleEntity' using a relation of type '1:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiRule()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.RuleCollection Rule
		{
			get	{ return GetMultiRule(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for Rule. When set to true, Rule is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Rule is accessed. You can always execute
		/// a forced fetch by calling GetMultiRule(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchRule
		{
			get	{ return _alwaysFetchRule; }
			set	{ _alwaysFetchRule = value; }	
		}		
				
		/// <summary>Gets / Sets the lazy loading flag if the property Rule already has been fetched. Setting this property to false when Rule has been fetched
		/// will clear the Rule collection well. Setting this property to true while Rule hasn't been fetched disables lazy loading for Rule</summary>
		[Browsable(false)]
		public bool AlreadyFetchedRule
		{
			get { return _alreadyFetchedRule;}
			set 
			{
				if(_alreadyFetchedRule && !value && (_rule != null))
				{
					_rule.Clear();
				}
				_alreadyFetchedRule = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'TargetConditionEntity' using a relation of type '1:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiTargetCondition()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.TargetConditionCollection TargetCondition
		{
			get	{ return GetMultiTargetCondition(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for TargetCondition. When set to true, TargetCondition is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time TargetCondition is accessed. You can always execute
		/// a forced fetch by calling GetMultiTargetCondition(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchTargetCondition
		{
			get	{ return _alwaysFetchTargetCondition; }
			set	{ _alwaysFetchTargetCondition = value; }	
		}		
				
		/// <summary>Gets / Sets the lazy loading flag if the property TargetCondition already has been fetched. Setting this property to false when TargetCondition has been fetched
		/// will clear the TargetCondition collection well. Setting this property to true while TargetCondition hasn't been fetched disables lazy loading for TargetCondition</summary>
		[Browsable(false)]
		public bool AlreadyFetchedTargetCondition
		{
			get { return _alreadyFetchedTargetCondition;}
			set 
			{
				if(_alreadyFetchedTargetCondition && !value && (_targetCondition != null))
				{
					_targetCondition.Clear();
				}
				_alreadyFetchedTargetCondition = value;
			}
		}

		/// <summary> Retrieves all related entities of type 'AttributeEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiAttributeCollectionViaDecisionNode()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.AttributeCollection AttributeCollectionViaDecisionNode
		{
			get { return GetMultiAttributeCollectionViaDecisionNode(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for AttributeCollectionViaDecisionNode. When set to true, AttributeCollectionViaDecisionNode is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time AttributeCollectionViaDecisionNode is accessed. You can always execute
		/// a forced fetch by calling GetMultiAttributeCollectionViaDecisionNode(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchAttributeCollectionViaDecisionNode
		{
			get	{ return _alwaysFetchAttributeCollectionViaDecisionNode; }
			set	{ _alwaysFetchAttributeCollectionViaDecisionNode = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property AttributeCollectionViaDecisionNode already has been fetched. Setting this property to false when AttributeCollectionViaDecisionNode has been fetched
		/// will clear the AttributeCollectionViaDecisionNode collection well. Setting this property to true while AttributeCollectionViaDecisionNode hasn't been fetched disables lazy loading for AttributeCollectionViaDecisionNode</summary>
		[Browsable(false)]
		public bool AlreadyFetchedAttributeCollectionViaDecisionNode
		{
			get { return _alreadyFetchedAttributeCollectionViaDecisionNode;}
			set 
			{
				if(_alreadyFetchedAttributeCollectionViaDecisionNode && !value && (_attributeCollectionViaDecisionNode != null))
				{
					_attributeCollectionViaDecisionNode.Clear();
				}
				_alreadyFetchedAttributeCollectionViaDecisionNode = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'AttributeEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiAttributeCollectionViaAttributeValue()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.AttributeCollection AttributeCollectionViaAttributeValue
		{
			get { return GetMultiAttributeCollectionViaAttributeValue(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for AttributeCollectionViaAttributeValue. When set to true, AttributeCollectionViaAttributeValue is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time AttributeCollectionViaAttributeValue is accessed. You can always execute
		/// a forced fetch by calling GetMultiAttributeCollectionViaAttributeValue(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchAttributeCollectionViaAttributeValue
		{
			get	{ return _alwaysFetchAttributeCollectionViaAttributeValue; }
			set	{ _alwaysFetchAttributeCollectionViaAttributeValue = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property AttributeCollectionViaAttributeValue already has been fetched. Setting this property to false when AttributeCollectionViaAttributeValue has been fetched
		/// will clear the AttributeCollectionViaAttributeValue collection well. Setting this property to true while AttributeCollectionViaAttributeValue hasn't been fetched disables lazy loading for AttributeCollectionViaAttributeValue</summary>
		[Browsable(false)]
		public bool AlreadyFetchedAttributeCollectionViaAttributeValue
		{
			get { return _alreadyFetchedAttributeCollectionViaAttributeValue;}
			set 
			{
				if(_alreadyFetchedAttributeCollectionViaAttributeValue && !value && (_attributeCollectionViaAttributeValue != null))
				{
					_attributeCollectionViaAttributeValue.Clear();
				}
				_alreadyFetchedAttributeCollectionViaAttributeValue = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'EffectEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiEffectCollectionViaRule()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.EffectCollection EffectCollectionViaRule
		{
			get { return GetMultiEffectCollectionViaRule(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for EffectCollectionViaRule. When set to true, EffectCollectionViaRule is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time EffectCollectionViaRule is accessed. You can always execute
		/// a forced fetch by calling GetMultiEffectCollectionViaRule(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchEffectCollectionViaRule
		{
			get	{ return _alwaysFetchEffectCollectionViaRule; }
			set	{ _alwaysFetchEffectCollectionViaRule = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property EffectCollectionViaRule already has been fetched. Setting this property to false when EffectCollectionViaRule has been fetched
		/// will clear the EffectCollectionViaRule collection well. Setting this property to true while EffectCollectionViaRule hasn't been fetched disables lazy loading for EffectCollectionViaRule</summary>
		[Browsable(false)]
		public bool AlreadyFetchedEffectCollectionViaRule
		{
			get { return _alreadyFetchedEffectCollectionViaRule;}
			set 
			{
				if(_alreadyFetchedEffectCollectionViaRule && !value && (_effectCollectionViaRule != null))
				{
					_effectCollectionViaRule.Clear();
				}
				_alreadyFetchedEffectCollectionViaRule = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'PolicyEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiPolicyCollectionViaRule()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.PolicyCollection PolicyCollectionViaRule
		{
			get { return GetMultiPolicyCollectionViaRule(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for PolicyCollectionViaRule. When set to true, PolicyCollectionViaRule is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time PolicyCollectionViaRule is accessed. You can always execute
		/// a forced fetch by calling GetMultiPolicyCollectionViaRule(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchPolicyCollectionViaRule
		{
			get	{ return _alwaysFetchPolicyCollectionViaRule; }
			set	{ _alwaysFetchPolicyCollectionViaRule = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property PolicyCollectionViaRule already has been fetched. Setting this property to false when PolicyCollectionViaRule has been fetched
		/// will clear the PolicyCollectionViaRule collection well. Setting this property to true while PolicyCollectionViaRule hasn't been fetched disables lazy loading for PolicyCollectionViaRule</summary>
		[Browsable(false)]
		public bool AlreadyFetchedPolicyCollectionViaRule
		{
			get { return _alreadyFetchedPolicyCollectionViaRule;}
			set 
			{
				if(_alreadyFetchedPolicyCollectionViaRule && !value && (_policyCollectionViaRule != null))
				{
					_policyCollectionViaRule.Clear();
				}
				_alreadyFetchedPolicyCollectionViaRule = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'TargetEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiTargetCollectionViaTargetCondition()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.TargetCollection TargetCollectionViaTargetCondition
		{
			get { return GetMultiTargetCollectionViaTargetCondition(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for TargetCollectionViaTargetCondition. When set to true, TargetCollectionViaTargetCondition is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time TargetCollectionViaTargetCondition is accessed. You can always execute
		/// a forced fetch by calling GetMultiTargetCollectionViaTargetCondition(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchTargetCollectionViaTargetCondition
		{
			get	{ return _alwaysFetchTargetCollectionViaTargetCondition; }
			set	{ _alwaysFetchTargetCollectionViaTargetCondition = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property TargetCollectionViaTargetCondition already has been fetched. Setting this property to false when TargetCollectionViaTargetCondition has been fetched
		/// will clear the TargetCollectionViaTargetCondition collection well. Setting this property to true while TargetCollectionViaTargetCondition hasn't been fetched disables lazy loading for TargetCollectionViaTargetCondition</summary>
		[Browsable(false)]
		public bool AlreadyFetchedTargetCollectionViaTargetCondition
		{
			get { return _alreadyFetchedTargetCollectionViaTargetCondition;}
			set 
			{
				if(_alreadyFetchedTargetCollectionViaTargetCondition && !value && (_targetCollectionViaTargetCondition != null))
				{
					_targetCollectionViaTargetCondition.Clear();
				}
				_alreadyFetchedTargetCollectionViaTargetCondition = value;
			}
		}

		/// <summary> Gets / sets related entity of type 'AttributeEntity'. This property is not visible in databound grids.
		/// Setting this property to a new object will make the load-on-demand feature to stop fetching data from the database, until you set this
		/// property to null. Setting this property to an entity will make sure that FK-PK relations are synchronized when appropriate.</summary>
		/// <remarks>This property is added for conveniance, however it is recommeded to use the method 'GetSingleAttribute()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the
		/// same scope. The property is marked non-browsable to make it hidden in bound controls, f.e. datagrids.</remarks>
		[Browsable(false)]
		public virtual AttributeEntity Attribute
		{
			get	{ return GetSingleAttribute(false); }
			set
			{
				if(base.IsDeserializing)
				{
					SetupSyncAttribute(value);
				}
				else
				{
					if(value==null)
					{
						if(_attribute != null)
						{
							_attribute.UnsetRelatedEntity(this, "DecisionNode");
						}
					}
					else
					{
						if(_attribute!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "DecisionNode");
						}
					}
				}
			}
		}

		/// <summary> Gets / sets the lazy loading flag for Attribute. When set to true, Attribute is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Attribute is accessed. You can always execute
		/// a forced fetch by calling GetSingleAttribute(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchAttribute
		{
			get	{ return _alwaysFetchAttribute; }
			set	{ _alwaysFetchAttribute = value; }	
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property Attribute already has been fetched. Setting this property to false when Attribute has been fetched
		/// will set Attribute to null as well. Setting this property to true while Attribute hasn't been fetched disables lazy loading for Attribute</summary>
		[Browsable(false)]
		public bool AlreadyFetchedAttribute
		{
			get { return _alreadyFetchedAttribute;}
			set 
			{
				if(_alreadyFetchedAttribute && !value)
				{
					this.Attribute = null;
				}
				_alreadyFetchedAttribute = value;
			}
		}

		/// <summary> Gets / sets the flag for what to do if the related entity available through the property Attribute is not found
		/// in the database. When set to true, Attribute will return a new entity instance if the related entity is not found, otherwise 
		/// null be returned if the related entity is not found. Default: true.</summary>
		[Browsable(false)]
		public bool AttributeReturnsNewIfNotFound
		{
			get	{ return _attributeReturnsNewIfNotFound; }
			set { _attributeReturnsNewIfNotFound = value; }	
		}
		/// <summary> Gets / sets related entity of type 'DecisionNodeEntity'. This property is not visible in databound grids.
		/// Setting this property to a new object will make the load-on-demand feature to stop fetching data from the database, until you set this
		/// property to null. Setting this property to an entity will make sure that FK-PK relations are synchronized when appropriate.</summary>
		/// <remarks>This property is added for conveniance, however it is recommeded to use the method 'GetSingleParent()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the
		/// same scope. The property is marked non-browsable to make it hidden in bound controls, f.e. datagrids.</remarks>
		[Browsable(false)]
		public virtual DecisionNodeEntity Parent
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
			get { return (int)policyDB.EntityType.DecisionNodeEntity; }
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
